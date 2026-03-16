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
 * Poll Instagram media container until it's FINISHED processing (for videos)
 */
async function waitForContainer(containerId: string, accessToken: string, maxWaitMs = 300000): Promise<boolean> {
    const pollInterval = 5000
    const maxAttempts = maxWaitMs / pollInterval

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

    console.warn(`[Container Poll] Timed out after ${maxWaitMs / 1000}s`)
    return false
}

/**
 * Save a post as a Draft without publishing or scheduling.
 */
export async function saveDraft(formData: FormData): Promise<ActionResult> {
    const session = await auth()
    if (!session?.user?.id) return { error: 'Not authenticated' }

    const caption = formData.get('caption') as string
    const mediaFile = formData.get('mediaFile') as File | null
    const connectedAccountId = formData.get('connectedAccountId') as string

    if (!connectedAccountId) {
        return { error: 'Please select an Instagram account first.' }
    }

    try {
        let finalImageUrl = 'https://placeholder.co/1080x1080'
        const isVideo = mediaFile ? mediaFile.type.startsWith('video/') : false

        if (mediaFile && mediaFile.size > 0) {
            if (mediaFile.size > MAX_FILE_SIZE) return { error: 'File exceeds the 500MB limit.' }
            const url = await uploadMediaToSupabase(mediaFile)
            if (url) finalImageUrl = url
        }

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
    const mediaFile = formData.get('mediaFile') as File | null
    const connectedAccountId = formData.get('connectedAccountId') as string

    if (!connectedAccountId) {
        return { error: 'Please select an Instagram account first.' }
    }
    if (!mediaFile || mediaFile.size === 0) {
        return { error: 'Please upload an image or video before publishing.' }
    }
    if (mediaFile.size > MAX_FILE_SIZE) {
        return { error: 'File exceeds the 500MB limit.' }
    }

    const isVideo = mediaFile.type.startsWith('video/')

    try {
        const account = await prisma.connectedAccount.findUnique({
            where: { id: connectedAccountId }
        })

        if (!account?.pageAccessToken || !account?.instagramBusinessId) {
            return { error: 'Instagram account implies missing access tokens. Please reconnect.' }
        }

        const uploadedUrl = await uploadMediaToSupabase(mediaFile)
        if (!uploadedUrl) return { error: 'Failed to upload media to storage.' }

        // 1. Create Media Container (Image or Reel)
        const containerUrl = `https://graph.facebook.com/v19.0/${account.instagramBusinessId}/media`
        const containerBody = isVideo
            ? {
                video_url: uploadedUrl,
                media_type: 'REELS',
                caption: caption || '',
                access_token: account.pageAccessToken
            }
            : {
                image_url: uploadedUrl,
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

        // 2. For videos, wait for Instagram to finish processing the Reel
        if (isVideo) {
            const ready = await waitForContainer(creationId, account.pageAccessToken)
            if (!ready) {
                return { error: 'Instagram is taking too long to process your video. Please try again.' }
            }
        }

        // 3. Publish Media
        const publishUrl = `https://graph.facebook.com/v19.0/${account.instagramBusinessId}/media_publish`
        const publishRes = await fetch(publishUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                creation_id: creationId,
                access_token: account.pageAccessToken
            })
        })

        const publishData = await publishRes.json()
        if (!publishRes.ok || publishData.error) {
            return { error: `IG Publish Error: ${publishData.error?.message || 'Unknown'}` }
        }

        // 4. Save to Database
        const post = await prisma.post.create({
            data: {
                userId: session.user.id,
                connectedAccountId,
                caption: caption || '',
                imageUrl: uploadedUrl,
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
    const mediaFile = formData.get('mediaFile') as File | null
    const connectedAccountId = formData.get('connectedAccountId') as string
    const scheduledForStr = formData.get('scheduledFor') as string

    if (!connectedAccountId) {
        return { error: 'Please select an Instagram account first.' }
    }
    if (!scheduledForStr) {
        return { error: 'Please select a date and time to schedule this post.' }
    }
    if (!mediaFile || mediaFile.size === 0) {
        return { error: 'Please upload an image or video to schedule a post.' }
    }
    if (mediaFile.size > MAX_FILE_SIZE) {
        return { error: 'File exceeds the 500MB limit.' }
    }

    const scheduledFor = new Date(scheduledForStr)
    if (scheduledFor <= new Date()) {
        return { error: 'Scheduled time must be in the future.' }
    }

    const isVideo = mediaFile.type.startsWith('video/')

    try {
        const uploadedUrl = await uploadMediaToSupabase(mediaFile)
        if (!uploadedUrl) return { error: 'Failed to upload media to storage.' }

        const post = await prisma.post.create({
            data: {
                userId: session.user.id,
                connectedAccountId,
                caption: caption || '',
                imageUrl: uploadedUrl,
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
