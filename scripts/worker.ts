import "dotenv/config"
import { prisma } from '@/lib/prisma'

// Delay between polling attempts (e.g. 30 seconds)
const POLL_INTERVAL_MS = 30000

async function processSchedule(scheduleId: string) {
    try {
        const schedule = await prisma.schedule.findUnique({
            where: { id: scheduleId },
            include: {
                post: {
                    include: {
                        instagramAccount: true
                    }
                }
            }
        })

        if (!schedule) throw new Error("Schedule not found")
        const { post } = schedule

        if (!post.instagramAccount) {
            throw new Error(`Schedule ${scheduleId} failed: Post ${post.id} has no linked Instagram account.`)
        }

        const { accessToken, instagramBusinessId } = post.instagramAccount

        if (!accessToken || !instagramBusinessId) {
            throw new Error(`Schedule ${scheduleId} failed: Missing Instagram access token or business account ID.`)
        }

        console.log(`[Worker] Started processing post ${post.id} for IG account ${instagramBusinessId}...`)

        // Step 1: Create Media Container
        // https://developers.facebook.com/docs/instagram-api/reference/ig-user/media
        const containerUrl = `https://graph.facebook.com/v19.0/${instagramBusinessId}/media`
        const containerRes = await fetch(containerUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image_url: post.imageUrl,
                caption: post.caption || '',
                access_token: accessToken
            })
        })

        const containerData = await containerRes.json()

        if (!containerRes.ok || containerData.error) {
            console.error(`[Worker] IG Media Container Error:`, containerData.error)
            throw new Error(`IG Container Error: ${containerData.error?.message || 'Unknown'}`)
        }

        const creationId = containerData.id
        console.log(`[Worker] Created Media Container: ${creationId}`)

        // Step 2: Publish the Media
        // https://developers.facebook.com/docs/instagram-api/reference/ig-user/media_publish
        const publishUrl = `https://graph.facebook.com/v19.0/${instagramBusinessId}/media_publish`
        const publishRes = await fetch(publishUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                creation_id: creationId,
                access_token: accessToken
            })
        })

        const publishData = await publishRes.json()

        if (!publishRes.ok || publishData.error) {
            console.error(`[Worker] IG Media Publish Error:`, publishData.error)
            throw new Error(`IG Publish Error: ${publishData.error?.message || 'Unknown'}`)
        }

        console.log(`[Worker] Successfully published post ${post.id}! IG Media ID: ${publishData.id}`)

        // Mark as published
        await prisma.schedule.update({
            where: { id: scheduleId },
            data: { status: 'PUBLISHED' }
        })

    } catch (error: any) {
        console.error(`[Worker] Error processing schedule ${scheduleId}:`, error.message)

        // Mark as failed
        await prisma.schedule.update({
            where: { id: scheduleId },
            data: { status: 'FAILED' }
        })
    }
}

async function pollQueue() {
    console.log(`[Worker] Polling for pending schedules...`)

    try {
        // Find overdue pending schedules and immediately mark them as processing (atomic-ish)
        // With lots of workers we'd use raw SQL row-level locks, but this works fine for a single worker
        const pendingSchedules = await prisma.schedule.findMany({
            where: {
                status: 'PENDING',
                scheduledFor: {
                    lte: new Date()
                }
            },
            take: 5 // Process 5 at a time
        })

        for (const schedule of pendingSchedules) {
            // Optimistic lock check (only update if it's STILL pending)
            const result = await prisma.schedule.updateMany({
                where: {
                    id: schedule.id,
                    status: 'PENDING'
                },
                data: {
                    status: 'PROCESSING'
                }
            })

            // If we successfully flipped it to processing, handle it
            if (result.count > 0) {
                await processSchedule(schedule.id)
            }
        }
    } catch (e) {
        console.error("[Worker] Polling error:", e)
    }

    // Schedule next poll
    setTimeout(pollQueue, POLL_INTERVAL_MS)
}

// Start worker
async function startWorker() {
    console.log("[Worker] Instagram Media Worker Started")
    pollQueue()
}

startWorker()
