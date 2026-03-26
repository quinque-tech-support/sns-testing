'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { supabaseAdmin } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type ActionResult = {
    success?: boolean
    error?: string
    postId?: string
}

const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB

/**
 * Helper to upload a File to Supabase Storage and return its public URL.
 */
async function uploadMediaToSupabase(file: File): Promise<string | null> {
    try {
        if (file.size > MAX_FILE_SIZE) {
            throw new Error('File exceeds the 500MB limit.')
        }

        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`

        // Use the File's ReadableStream directly to avoid loading the entire file into RAM.
        // This is critical for large video uploads (100MB+).
        const { error } = await supabaseAdmin
            .storage
            .from('media-uploads')
            .upload(fileName, file, {
                contentType: file.type,
                duplex: 'half',
                upsert: false,
            } as any)

        if (error) {
            console.error('[Supabase Upload Error]', error)
            return null
        }

        const { data } = supabaseAdmin
            .storage
            .from('media-uploads')
            .getPublicUrl(fileName)

        return data.publicUrl
    } catch (e) {
        console.error('[Upload helper exception]', e)
        return null
    }
}

/**
 * Poll Instagram media container until it's FINISHED processing.
 * Required for BOTH images and videos — Instagram processes asynchronously.
 * Images typically finish in 1-2 polls (~5-10s); videos may take minutes.
 */
async function waitForContainer(containerId: string, accessToken: string, isVideo = false): Promise<boolean> {
    const pollInterval = 5000
    const maxAttempts = isVideo ? 60 : 12 // 60×5s=5min for video, 12×5s=60s for image

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        await new Promise(resolve => setTimeout(resolve, pollInterval))

        const res = await fetch(
            `https://graph.facebook.com/v19.0/${containerId}?fields=status_code&access_token=${accessToken}`
        )
        const data = await res.json()

        console.log(`[Container Poll] Attempt ${attempt + 1}: status_code = ${data.status_code}`)

        if (data.status_code === 'FINISHED') return true
        if (data.status_code === 'ERROR' || data.error) {
            console.error('[Container Poll] Error:', data)
            return false
        }
    }

    console.warn(`[Container Poll] Timed out waiting for container ${containerId}`)
    return false
}

/**
 * Save a post as a Draft without publishing or scheduling.
 */
export async function saveDraft(formData: FormData): Promise<ActionResult> {
    const session = await auth()
    if (!session?.user?.id) return { error: 'Not authenticated' }

    const caption = formData.get('caption') as string
    const connectedAccountId = formData.get('connectedAccountId') as string
    const mediaUrl = formData.get('mediaUrl') as string
    const isVideo = formData.get('isVideo') === 'true'

    if (!connectedAccountId) {
        return { error: 'Please select an Instagram account first.' }
    }

    try {
        let finalImageUrl = mediaUrl || 'https://placeholder.co/1080x1080'

        const post = await prisma.post.create({
            data: {
                userId: session.user.id,
                connectedAccountId,
                caption: caption || '',
                imageUrl: finalImageUrl,
                mediaType: isVideo ? 'VIDEO' : 'IMAGE',
            }
        })

        revalidatePath('/dashboard')
        revalidatePath('/workflow')
        return { success: true, postId: post.id }
    } catch (err: any) {
        console.error('[saveDraft]', err)
        return { error: err.message || 'Failed to save draft. Please try again.' }
    }
}

/**
 * Publish a post immediately - supports both images and videos (Reels).
 */
export async function publishNow(formData: FormData): Promise<ActionResult> {
    const session = await auth()
    if (!session?.user?.id) return { error: 'Not authenticated' }

    const caption = formData.get('caption') as string
    const mediaUrl = formData.get('mediaUrl') as string
    const isVideo = formData.get('isVideo') === 'true'
    const connectedAccountId = formData.get('connectedAccountId') as string

    if (!connectedAccountId) {
        return { error: 'Please select an Instagram account first.' }
    }
    if (!mediaUrl) {
        return { error: 'Please upload an image or video before publishing.' }
    }

    try {
        const account = await prisma.connectedAccount.findUnique({
            where: { id: connectedAccountId }
        })

        if (!account?.pageAccessToken || !account?.instagramBusinessId) {
            return { error: 'Instagram account implies missing access tokens. Please reconnect.' }
        }

        // 1. Create Media Container (Image or Reel)
        const containerUrl = `https://graph.facebook.com/v19.0/${account.instagramBusinessId}/media`
        const containerBody = isVideo
            ? {
                video_url: mediaUrl,
                media_type: 'REELS',
                share_to_feed: true,
                caption: caption || '',
                access_token: account.pageAccessToken
            }
            : {
                image_url: mediaUrl,
                caption: caption || '',
                access_token: account.pageAccessToken
            }

        const containerRes = await fetch(containerUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(containerBody)
        })

        const containerData = await containerRes.json()
        if (!containerRes.ok || containerData.error) {
            return { error: `IG Container Error: ${containerData.error?.message || 'Unknown'}` }
        }

        const creationId = containerData.id
        console.log(`[publishNow] Container created: ${creationId}, isVideo: ${isVideo}`)

        // 2. Wait for Instagram to finish processing (required for BOTH images and videos)
        const ready = await waitForContainer(creationId, account.pageAccessToken, isVideo)
        if (!ready) {
            return { error: `Instagram is taking too long to process your ${isVideo ? 'video' : 'image'}. Please try again.` }
        }

        // 3. Publish Media — retry up to 3 times with backoff for transient "not ready" errors
        const publishUrl = `https://graph.facebook.com/v19.0/${account.instagramBusinessId}/media_publish`
        let publishData: any = null
        const MAX_PUBLISH_RETRIES = 3
        for (let attempt = 1; attempt <= MAX_PUBLISH_RETRIES; attempt++) {
            const publishRes = await fetch(publishUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    creation_id: creationId,
                    access_token: account.pageAccessToken
                })
            })
            publishData = await publishRes.json()

            if (publishRes.ok && !publishData.error) break // success

            const isTransient = publishData.error?.error_subcode === 2207027 // Media not ready
            if (!isTransient || attempt === MAX_PUBLISH_RETRIES) {
                console.error(`[publishNow] IG Publish Error (attempt ${attempt}):`, publishData.error)
                return { error: `IG Publish Error: ${publishData.error?.message || 'Unknown'}` }
            }

            console.warn(`[publishNow] Media not ready yet, retrying in 5s (attempt ${attempt}/${MAX_PUBLISH_RETRIES})...`)
            await new Promise(r => setTimeout(r, 5000))
        }

        // 4. Save to Database
        const post = await prisma.post.create({
            data: {
                userId: session.user.id,
                connectedAccountId,
                caption: caption || '',
                imageUrl: mediaUrl,
                mediaType: isVideo ? 'VIDEO' : 'IMAGE',
                instagramMediaId: publishData.id,
            }
        })

        // Create a schedule entry immediately marked as PUBLISHED
        await prisma.schedule.create({
            data: {
                postId: post.id,
                scheduledFor: new Date(),
                status: 'PUBLISHED',
            }
        })

        revalidatePath('/dashboard')
        revalidatePath('/workflow')
        return { success: true, postId: post.id }
    } catch (err: any) {
        console.error('[publishNow]', err)
        return { error: err.message || 'Failed to publish post. Please try again.' }
    }
}

/**
 * Schedule a post for a future date and time.
 */
export async function schedulePost(formData: FormData): Promise<ActionResult> {
    const session = await auth()
    if (!session?.user?.id) return { error: 'Not authenticated' }

    const caption = formData.get('caption') as string
    const mediaUrl = formData.get('mediaUrl') as string
    const isVideo = formData.get('isVideo') === 'true'
    const connectedAccountId = formData.get('connectedAccountId') as string
    const scheduledForStr = formData.get('scheduledFor') as string

    if (!connectedAccountId) {
        return { error: 'Please select an Instagram account first.' }
    }
    if (!scheduledForStr) {
        return { error: 'Please select a date and time to schedule this post.' }
    }
    if (!mediaUrl) {
        return { error: 'Please upload an image or video to schedule a post.' }
    }

    const scheduledFor = new Date(scheduledForStr)
    if (scheduledFor <= new Date()) {
        return { error: 'Scheduled time must be in the future.' }
    }

    try {
        const post = await prisma.post.create({
            data: {
                userId: session.user.id,
                connectedAccountId,
                caption: caption || '',
                imageUrl: mediaUrl,
                mediaType: isVideo ? 'VIDEO' : 'IMAGE',
            }
        })

        await prisma.schedule.create({
            data: {
                postId: post.id,
                scheduledFor,
                status: 'PENDING',
            }
        })

        revalidatePath('/dashboard')
        revalidatePath('/calendar')
        revalidatePath('/workflow')
        return { success: true, postId: post.id }
    } catch (err: any) {
        console.error('[schedulePost]', err)
        return { error: err.message || 'Failed to schedule post. Please try again.' }
    }
}
