import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { facebookService } from '@/lib/services/facebook.service'
import { automationService } from '@/lib/services/automation.service'
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs'
import { IG_GRAPH_BASE } from '@/lib/constants'

// Important: This route should be secured in production so that only authorized cron jobs can trigger it.
// For now, it's open for easy testing.

export const dynamic = 'force-dynamic' // Ensure this route is never cached

async function processSchedule(scheduleId: string) {
    // Atomically claim the schedule so a retried/overlapping cron invocation
    // can't pick up and publish the same PENDING schedule twice.
    const claim = await prisma.schedule.updateMany({
        where: { id: scheduleId, status: 'PENDING' },
        data: { status: 'PROCESSING' }
    })
    if (claim.count === 0) {
        return { success: false, scheduleId, error: 'Already claimed by another invocation' }
    }

    try {
        const schedule = await prisma.schedule.findUnique({
            where: { id: scheduleId },
            include: {
                post: {
                    include: {
                        connectedAccount: true
                    }
                }
            }
        })

        if (!schedule) throw new Error("Schedule not found")
        const { post } = schedule

        if (!post.connectedAccount) {
            throw new Error(`Schedule ${scheduleId} failed: Post ${post.id} has no linked connected account.`)
        }

        const { pageAccessToken, instagramBusinessId } = post.connectedAccount

        if (!pageAccessToken || !instagramBusinessId) {
            throw new Error(`Schedule ${scheduleId} failed: Missing page access token or business account ID.`)
        }

        const isVideo = post.mediaType === 'VIDEO'
        console.log(`[Cron] Processing post ${post.id} (${isVideo ? 'VIDEO/Reel' : 'IMAGE'}) for IG account ${instagramBusinessId}...`)

        // Step 1: Create Media Container (image or Reel)
        const containerUrl = `${IG_GRAPH_BASE}/${instagramBusinessId}/media`
        const containerBody = isVideo
            ? {
                video_url: post.imageUrl,
                media_type: 'REELS',
                share_to_feed: true,
                caption: post.caption || '',
                access_token: pageAccessToken
            }
            : {
                image_url: post.imageUrl,
                caption: post.caption || '',
                access_token: pageAccessToken
            }

        const containerRes = await fetch(containerUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(containerBody)
        })

        const containerData = await containerRes.json()

        if (!containerRes.ok || containerData.error) {
            console.error(`[Cron] IG Media Container Error:`, containerData.error)
            throw new Error(`IG Container Error: ${containerData.error?.message || 'Unknown'}`)
        }

        const creationId = containerData.id
        console.log(`[Cron] Created Media Container: ${creationId}`)

        // Step 2: Poll until the container is FINISHED (required for both images and videos)
        // Images typically finish in 1-2 polls; videos may take longer.
        const maxAttempts = isVideo ? 18 : 12 // 18 × 5s = 90s for video, 12 × 5s = 60s for image
        let ready = false
        for (let i = 0; i < maxAttempts; i++) {
            if (process.env.NODE_ENV !== 'test') await new Promise(r => setTimeout(r, 5000))
            const statusRes = await fetch(
                `${IG_GRAPH_BASE}/${creationId}?fields=status_code&access_token=${pageAccessToken}`
            )
            const statusData = await statusRes.json()
            console.log(`[Cron] Container status (attempt ${i + 1}): ${statusData.status_code}`)
            if (statusData.status_code === 'FINISHED') { ready = true; break }
            if (statusData.status_code === 'ERROR') throw new Error(`IG ${isVideo ? 'video' : 'image'} container failed during processing`)
        }
        if (!ready) throw new Error(`Timed out waiting for IG ${isVideo ? 'video' : 'image'} container to finish processing`)

        // Step 3: Publish the Media
        const publishUrl = `${IG_GRAPH_BASE}/${instagramBusinessId}/media_publish`
        const publishRes = await fetch(publishUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                creation_id: creationId,
                access_token: pageAccessToken
            })
        })

        const publishData = await publishRes.json()

        if (!publishRes.ok || publishData.error) {
            console.error(`[Cron] IG Media Publish Error:`, publishData.error)
            throw new Error(`IG Publish Error: ${publishData.error?.message || 'Unknown'}`)
        }

        console.log(`[Cron] Successfully published post ${post.id}! IG Media ID: ${publishData.id}`)

        // Mark as published and save the instagramMediaId
        await prisma.schedule.update({
            where: { id: scheduleId },
            data: { status: 'PUBLISHED' }
        })

        await prisma.post.update({
            where: { id: post.id },
            data: { instagramMediaId: publishData.id }
        })

        return { success: true, scheduleId, mediaId: publishData.id }

    } catch (error) {
        console.error(`[Cron] Error processing schedule ${scheduleId}:`, error instanceof Error ? error.message : 'Unknown')

        await prisma.schedule.update({
            where: { id: scheduleId },
            data: { status: 'FAILED' }
        })

        return { success: false, scheduleId, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

// The handler function that actually runs your logic
async function handler(_req: Request) {
    try {
        console.log(`[Cron] Executing job via Upstash QStash...`)

        // 1. Process Pending Schedules (Max 3 to prevent timeouts)
        const pendingSchedules = await prisma.schedule.findMany({
            where: {
                status: 'PENDING',
                scheduledFor: { lte: new Date() }
            },
            take: 3
        })

        const publishedResults = []
        for (const schedule of pendingSchedules) {
            const processResult = await processSchedule(schedule.id)
            publishedResults.push(processResult)
        }

        // 2. Sync Insights for published posts
        
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
        const postsToSync = await prisma.post.findMany({
            where: {
                instagramMediaId: { not: null },
                schedules: {
                    some: {
                        status: 'PUBLISHED',
                        scheduledFor: { lte: oneHourAgo }
                    }
                }
            },
            include: { connectedAccount: true },
            take: 5,
            orderBy: { createdAt: 'desc' }
        })

        let syncedCount = 0
        for (const post of postsToSync) {
            if (!post.instagramMediaId || !post.connectedAccount?.pageAccessToken) continue;

            const insights = await facebookService.getMediaInsights(post.instagramMediaId, post.connectedAccount.pageAccessToken)
            if (insights) {
                await prisma.post.update({
                    where: { id: post.id },
                    data: {
                        views: insights.views,
                        reach: insights.reach,
                        saves: insights.saves,
                        likes: insights.likes
                    }
                })
                syncedCount++
            }
        }

        // 3. Process due DM automation events (auto-replies)
        const dmResult = await automationService.processDueEvents()

        // 4. Cleanup expired follow targets (QUEUED profiles not approved after 24 hours)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        const deletedTargets = await prisma.followTarget.deleteMany({
            where: {
                status: 'QUEUED',
                createdAt: { lt: twentyFourHoursAgo }
            }
        })

        return NextResponse.json({
            message: `Processed ${publishedResults.length} post(s). Synced insights for ${syncedCount} post(s). DM replies: ${dmResult.dmReplies}, failed: ${dmResult.failed}. Cleaned up ${deletedTargets.count} expired follow targets.`,
            publishedResults,
            dmReplies: dmResult.dmReplies,
            dmFailed: dmResult.failed
        })
    } catch (e) {
        console.error("[Cron] Error:", e)
        return NextResponse.json({ error: "Internal Server Error", message: e instanceof Error ? e.message : 'Unknown' }, { status: 500 })
    }
}

// QStash intercepts the GET/POST request and verifies the signature securely in production
const isDevOrTest = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'

const appUrl = process.env.NEXTAUTH_URL || 'https://gravia.vercel.app';
const cronUrl = `${appUrl.endsWith('/') ? appUrl.slice(0, -1) : appUrl}/api/cron`;

export const POST = isDevOrTest
    ? handler
    : verifySignatureAppRouter(handler, {
        url: cronUrl
    });

export const GET = isDevOrTest
    ? handler
    : async () => NextResponse.json({ error: "Method not allowed" }, { status: 405 });
