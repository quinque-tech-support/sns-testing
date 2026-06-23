'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth.utils'
import { facebookService } from '@/lib/services/facebook.service'
import { revalidatePath } from 'next/cache'

export async function getCampaigns(accountId: string) {
    const userId = await requireAuth()
    const campaigns = await prisma.followCampaign.findMany({
        where: { userId, accountId },
        orderBy: { createdAt: 'desc' },
    })
    return campaigns
}

export async function createCampaign(accountId: string, name: string, hashtagsStr: string) {
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
            hashtags
        }
    })
    revalidatePath('/follow-manager')
    return campaign
}

export async function searchPosts(campaignId: string, accountId: string) {
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
    
    revalidatePath('/follow-manager')
    return toInsert
}

export async function markFollowTarget(campaignId: string, accountId: string, postId: string, authorName?: string) {
    const userId = await requireAuth()
    
    if (authorName && authorName.length > 100) {
        throw new Error("Author name cannot exceed 100 characters")
    }
    
    const target = await prisma.followTarget.findUnique({
        where: {
            userId_postId: {
                userId,
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

export async function getCampaignTargets(campaignId: string, accountId: string, page: number = 1, limit: number = 20, timeFilter: string = 'ALL') {
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

    const [targets, totalCount] = await prisma.$transaction([
        prisma.followTarget.findMany({
            where,
            orderBy: { followedAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
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
