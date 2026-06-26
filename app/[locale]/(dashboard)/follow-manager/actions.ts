'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth.utils'
import { facebookService } from '@/lib/services/facebook.service'
import { revalidatePath } from 'next/cache'
import { callModel } from '@/lib/ai/utils/callModel'

export async function getCampaigns(accountId: string) {
    const userId = await requireAuth()
    const campaigns = await prisma.followCampaign.findMany({
        where: { userId, accountId },
        orderBy: { createdAt: 'desc' },
    })
    return campaigns
}

export async function createCampaign(accountId: string, name: string, hashtagsStr: string, niche?: string, location?: string) {
    const userId = await requireAuth()
    const hashtags = hashtagsStr.split(',').map(h => h.trim().replace(/^#/, '')).filter(Boolean)
    
    if (!name || name.length > 100) throw new Error("Invalid campaign name length (max 100 characters)")
    if (hashtags.length === 0 || hashtags.length > 10) throw new Error("Campaign must have between 1 and 10 hashtags")
    if (hashtags.some(h => h.length > 50)) throw new Error("Individual hashtags cannot exceed 50 characters")
    
    const campaign = await prisma.followCampaign.create({
        data: {
            userId,
            accountId,
            name,
            hashtags,
            niche,
            location
        }
    })
    revalidatePath('/follow-manager')
    return campaign
}

export async function searchPosts(campaignId: string, accountId: string, niche?: string, location?: string) {
    const userId = await requireAuth()
    const campaign = await prisma.followCampaign.findUnique({
        where: { id: campaignId, userId }
    })
    if (!campaign) throw new Error("Campaign not found")
    
    const account = await prisma.connectedAccount.findUnique({
        where: { id: accountId, userId }
    })
    if (!account?.instagramBusinessId || !account?.pageAccessToken) {
        throw new Error("Account not configured correctly")
    }
    const igBusId = account.instagramBusinessId
    const pageToken = account.pageAccessToken

    // --- OLD HASHTAG SEARCH LOGIC (COMMENTED OUT) ---
    /*
    // Fetch for up to 5 hashtags to avoid hitting rate limits immediately
    const tagsToFetch = campaign.hashtags.slice(0, 5)
    
    const mediaResults = await Promise.all(tagsToFetch.map(async (tag) => {
        const htId = await facebookService.getHashtagId(igBusId, tag, pageToken)
        if (htId) {
            return facebookService.getHashtagTopMedia(htId, igBusId, pageToken)
        }
        return []
    }))
    
    const allMedia = mediaResults.flat()
    
    // Deduplicate by ID
    const unique = Array.from(new Map(allMedia.map(m => [m.id, m])).values())
    
    // Filter out ones we already tracked
    const existing = await prisma.followTarget.findMany({
        where: { userId, accountId },
        select: { postId: true }
    })
    const existingIds = new Set(existing.map(e => e.postId))
    
    const toInsert = unique.filter(m => !existingIds.has(m.id)).slice(0, 30)
    
    if (toInsert.length > 0) {
        await prisma.followTarget.createMany({
            data: toInsert.map(post => ({
                userId,
                accountId,
                campaignId,
                postId: post.id,
                postLink: post.permalink,
                postImage: post.media_url,
                status: 'QUEUED'
            })),
            skipDuplicates: true
        })
    }
    */
    
    // --- NEW GEMINI + BUSINESS DISCOVERY SEARCH LOGIC ---
    
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

    const prompt = `
Generate a JSON list of 10 relevant Instagram usernames that exist in the real world related to the following criteria.
Niche: ${niche || 'General'}
Location: ${location || 'Global'}
Hashtags: ${campaign.hashtags.join(', ')}

Respond ONLY with a JSON array of strings containing the usernames. Example:
["username1", "username2"]
`;
    
    let generatedUsernames: string[] = [];
    try {
        generatedUsernames = await callModel(apiKey, prompt, { label: 'FollowManagerSearch' });
        if (!Array.isArray(generatedUsernames)) {
            throw new Error("Invalid format returned from AI.");
        }
    } catch (e: any) {
        console.error("Failed to generate usernames from AI", e);
        throw new Error("AI Search Failed: " + e.message);
    }
    
    // Check which ones we already tracked by authorName
    const existing = await prisma.followTarget.findMany({
        where: { userId, accountId, campaignId },
        select: { authorName: true }
    });
    const existingNames = new Set(existing.map(e => (e.authorName || '').toLowerCase()));
    
    const newNamesToFetch = generatedUsernames.filter(name => !existingNames.has(name.toLowerCase()));
    
    let validProfiles = [];
    try {
        for (const username of newNamesToFetch) {
            const profile = await facebookService.getBusinessDiscoveryProfile(igBusId, username, pageToken);
            if (profile) {
                validProfiles.push(profile);
            }
        }
    } catch (e: any) {
        console.error("Failed to fetch profiles from Instagram", e);
        throw new Error("An error occurred while communicating with Instagram.");
    }
    
    if (validProfiles.length > 0) {
        try {
            const safeProfiles = validProfiles.filter(p => p.username && p.id)

if (safeProfiles.length > 0) {
            await prisma.followTarget.createMany({
                data: safeProfiles.map(profile => ({
                    userId,
                    accountId,
                    campaignId,
                    postId: profile.id,
                    postLink: `https://instagram.com/${profile.username}`,
                    postImage: profile.profile_picture_url || '',
                    authorName: profile.username,
                    followersCount: profile.followers_count || 0,
                    mediaCount: profile.media_count || 0,
                    biography: profile.biography || '',
                    status: 'QUEUED'
                })),
                skipDuplicates: true
            })
        }   
        } catch (e: any) {
            console.error("Database error while saving targets:", e);
            throw new Error("An internal error occurred while saving the discovered profiles.");
        }
    }
    
    try {
        revalidatePath('/follow-manager')
    } catch (e) {
        console.error("Failed to revalidate path", e)
    }
    return validProfiles
}

export async function markFollowTarget(campaignId: string, accountId: string, postId: string, authorName?: string) {
    const userId = await requireAuth()
    
    if (authorName && authorName.length > 100) {
        throw new Error("Author name cannot exceed 100 characters")
    }
    
    const target = await prisma.followTarget.findUnique({
        where: {
            userId_campaignId_postId: {
                userId,
                campaignId,
                postId
            }
        }
    })
    
    if (!target) {
        throw new Error("Follow target not found in database")
    }
    
    await prisma.followTarget.update({
        where: {
            id: target.id
        },
        data: {
            status: 'FOLLOWED',
            followedAt: new Date(),
            authorName: authorName || undefined
        }
    })
    
    revalidatePath('/follow-manager')
    return { success: true }
}

export async function getCampaignTargets(
    campaignId: string, 
    accountId: string, 
    page: number = 1, 
    limit: number = 20, 
    timeFilter: string = 'ALL',
    statusFilter: string = 'ALL',
    sortBy: string = 'createdAt',
    sortOrder: string = 'desc'
) {
    const userId = await requireAuth()
    
    let dateFilter: any = undefined
    if (timeFilter === 'TODAY') {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        dateFilter = { gte: today }
    } else if (timeFilter === 'WEEK') {
        const week = new Date()
        week.setDate(week.getDate() - 7)
        dateFilter = { gte: week }
    } else if (timeFilter === 'MONTH') {
        const month = new Date()
        month.setMonth(month.getMonth() - 1)
        dateFilter = { gte: month }
    }

    const where: any = {
        userId,
        accountId,
        ...(dateFilter ? { followedAt: dateFilter } : {})
    }
    if (campaignId && campaignId !== 'ALL') {
        where.campaignId = campaignId
    }
    if (statusFilter && statusFilter !== 'ALL') {
        where.status = statusFilter
    }

    // Build orderBy
    let orderBy: any = { createdAt: 'desc' }
    if (sortBy === 'followedAt') {
        orderBy = { followedAt: sortOrder }
    } else if (sortBy === 'campaignId') {
        orderBy = { campaignId: sortOrder }
    } else if (sortBy === 'createdAt') {
        orderBy = { createdAt: sortOrder }
    }

    const [targets, totalCount] = await prisma.$transaction([
        prisma.followTarget.findMany({
            where,
            orderBy,
            skip: (page - 1) * limit,
            take: limit,
            include: { campaign: { select: { name: true } } }
        }),
        prisma.followTarget.count({ where })
    ])

    return {
        targets,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
    }
}

export async function unfollowTarget(targetId: string, accountId: string) {
    const userId = await requireAuth()
    
    await prisma.followTarget.delete({
        where: {
            id: targetId,
            userId,
            accountId
        }
    })
    
    revalidatePath('/follow-manager')
    return { success: true }
}

export async function deleteCampaign(campaignId: string, accountId: string) {
    const userId = await requireAuth()
    
    await prisma.followCampaign.delete({
        where: {
            id: campaignId,
            userId,
            accountId
        }
    })
    
    revalidatePath('/follow-manager')
    return { success: true }
}

export async function renameCampaign(campaignId: string, accountId: string, name: string) {
    const userId = await requireAuth()
    
    await prisma.followCampaign.update({
        where: {
            id: campaignId,
            userId,
            accountId
        },
        data: { name }
    })
    
    revalidatePath('/follow-manager')
    return { success: true }
}

export async function updateCampaign(
    campaignId: string, 
    accountId: string, 
    data: { name?: string, hashtags?: string[], niche?: string | null, location?: string | null }
) {
    const userId = await requireAuth()
    
    if (data.name && data.name.length > 100) throw new Error("Campaign name too long")
    if (data.hashtags && data.hashtags.length > 10) throw new Error("Too many hashtags (max 10)")
    
    await prisma.followCampaign.update({
        where: {
            id: campaignId,
            userId,
            accountId
        },
        data: {
            ...(data.name !== undefined ? { name: data.name } : {}),
            ...(data.hashtags !== undefined ? { hashtags: data.hashtags } : {}),
            ...(data.niche !== undefined ? { niche: data.niche } : {}),
            ...(data.location !== undefined ? { location: data.location } : {}),
        }
    })
    
    revalidatePath('/follow-manager')
    return { success: true }
}

export async function getCampaignStats(campaignId: string, accountId: string) {
    const userId = await requireAuth()
    
    const where: any = { userId, accountId }
    if (campaignId && campaignId !== 'ALL') {
        where.campaignId = campaignId
    }
    
    const [discovered, followed, unfollowReady] = await prisma.$transaction([
        prisma.followTarget.count({ where: { ...where, status: 'QUEUED' } }),
        prisma.followTarget.count({ where: { ...where, status: 'FOLLOWED' } }),
        prisma.followTarget.count({ where: { ...where, status: 'UNFOLLOW_READY' } }),
    ])
    
    return { discovered, followed, unfollowReady }
}

export async function markUnfollowReady(targetId: string, accountId: string) {
    const userId = await requireAuth()
    
    await prisma.followTarget.update({
        where: {
            id: targetId,
            userId,
            accountId,
        },
        data: {
            status: 'UNFOLLOW_READY'
        }
    })
    
    revalidatePath('/follow-manager')
    return { success: true }
}

export async function markUnfollowed(targetId: string, accountId: string) {
    const userId = await requireAuth()
    
    await prisma.followTarget.update({
        where: {
            id: targetId,
            userId,
            accountId,
        },
        data: {
            status: 'UNFOLLOWED'
        }
    })
    
    revalidatePath('/follow-manager')
    return { success: true }
}
