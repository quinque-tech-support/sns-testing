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

/**
 * Helper to upload a File to Supabase Storage and return its public URL.
 */
async function uploadMediaToSupabase(file: File): Promise<string | null> {
    try {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`

        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const { error } = await supabaseAdmin
            .storage
            .from('media-uploads')
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: false
            })

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
 * Save a post as a Draft without publishing or scheduling.
 * For this implementation we extract the mediaFile uploaded from the form data.
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
        if (mediaFile && mediaFile.size > 0) {
            const url = await uploadMediaToSupabase(mediaFile)
            if (url) finalImageUrl = url
        }

        const post = await prisma.post.create({
            data: {
                userId: session.user.id,
                connectedAccountId,
                caption: caption || '',
                imageUrl: finalImageUrl,
            }
        })

        revalidatePath('/dashboard')
        revalidatePath('/workflow')
        return { success: true, postId: post.id }
    } catch (err: any) {
        console.error('[saveDraft]', err)
        return { error: 'Failed to save draft. Please try again.' }
    }
}

/**
 * Publish a post immediately by creating it and marking the schedule as PUBLISHED immediately.
 * In production, this would call the Facebook Graph API to create a media container and publish.
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

    try {
        const account = await prisma.connectedAccount.findUnique({
            where: { id: connectedAccountId }
        })

        if (!account?.pageAccessToken || !account?.instagramBusinessId) {
            return { error: 'Instagram account implies missing access tokens. Please reconnect.' }
        }

        let finalImageUrl = 'https://placeholder.co/1080x1080'
        if (mediaFile && mediaFile.size > 0) {
            const uploadedUrl = await uploadMediaToSupabase(mediaFile)
            if (uploadedUrl) finalImageUrl = uploadedUrl
            else return { error: 'Failed to upload media to storage.' }
        }

        // 1. Create Media Container
        const containerUrl = `https://graph.facebook.com/v19.0/${account.instagramBusinessId}/media`
        const containerRes = await fetch(containerUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image_url: finalImageUrl,
                caption: caption || '',
                access_token: account.pageAccessToken
            })
        })

        const containerData = await containerRes.json()
        if (!containerRes.ok || containerData.error) {
            return { error: `IG Container Error: ${containerData.error?.message || 'Unknown'}` }
        }

        const creationId = containerData.id

        // 2. Publish Media
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

        // 3. Save to Database
        const post = await prisma.post.create({
            data: {
                userId: session.user.id,
                connectedAccountId,
                caption: caption || '',
                imageUrl: finalImageUrl,
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
        return { error: 'Failed to publish post. Please try again.' }
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

    const scheduledFor = new Date(scheduledForStr)
    if (scheduledFor <= new Date()) {
        return { error: 'Scheduled time must be in the future.' }
    }

    try {
        let finalImageUrl = 'https://placeholder.co/1080x1080'
        if (mediaFile && mediaFile.size > 0) {
            const uploadedUrl = await uploadMediaToSupabase(mediaFile)
            if (uploadedUrl) finalImageUrl = uploadedUrl
            else return { error: 'Failed to upload media to storage.' }
        }

        const post = await prisma.post.create({
            data: {
                userId: session.user.id,
                connectedAccountId,
                caption: caption || '',
                imageUrl: finalImageUrl,
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
        return { error: 'Failed to schedule post. Please try again.' }
    }
}
