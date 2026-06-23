'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth.utils'
import { facebookService } from '@/lib/services/facebook.service'
import { revalidatePath } from 'next/cache'

export async function getCampaigns(accountId: string) {
    const userId = await requireAuth()
    const campaigns = await prisma.followCampaign.findMany({
        where: { userId, accountId },
        include: {
            targets: {
                orderBy: { createdAt: 'desc' },
                take: 10
            }
        },
        orderBy: { createdAt: 'desc' },
    })
    return campaigns
}

export async function createCampaign(accountId: string, name: string, hashtagsStr: string) {
    const userId = await requireAuth()
    const hashtags = hashtagsStr.split(',').map(h => h.trim().replace(/^#/, '')).filter(Boolean)
    if (!name || hashtags.length === 0) throw new Error("Invalid input")
    
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

    const allMedia = []
    // Fetch for up to 3 hashtags to avoid hitting rate limits immediately
    const tagsToFetch = campaign.hashtags.slice(0, 3)
    
    for (const tag of tagsToFetch) {
        const htId = await facebookService.getHashtagId(account.instagramBusinessId, tag, account.pageAccessToken)
        if (htId) {
            const media = await facebookService.getHashtagTopMedia(htId, account.instagramBusinessId, account.pageAccessToken)
            allMedia.push(...media)
        }
    }
    
    // Deduplicate by ID
    const unique = Array.from(new Map(allMedia.map(m => [m.id, m])).values())
    
    // Filter out ones we already tracked
    const existing = await prisma.followTarget.findMany({
        where: { userId, accountId },
        select: { postId: true }
    })
    const existingIds = new Set(existing.map(e => e.postId))
    
    return unique.filter(m => !existingIds.has(m.id)).slice(0, 30) // Return top 30
}

export async function markFollowTarget(campaignId: string, accountId: string, post: any) {
    const userId = await requireAuth()
    
    await prisma.followTarget.upsert({
        where: {
            userId_postId: {
                userId,
                postId: post.id
            }
        },
        update: {
            status: 'FOLLOWED',
            followedAt: new Date()
        },
        create: {
            userId,
            accountId,
            campaignId,
            postId: post.id,
            postLink: post.permalink,
            postImage: post.media_url,
            status: 'FOLLOWED',
            followedAt: new Date()
        }
    })
    
    revalidatePath('/follow-manager')
    return { success: true }
}
