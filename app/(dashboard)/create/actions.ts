'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type ActionResult = {
    success?: boolean
    error?: string
    postId?: string
}

/**
 * Save a post as a Draft without publishing or scheduling.
 * The image URL is required (should be uploaded to a storage service first).
 * For this implementation we use a placeholder URL and accept a caption.
 */
export async function saveDraft(formData: FormData): Promise<ActionResult> {
    const session = await auth()
    if (!session?.user?.id) return { error: 'Not authenticated' }

    const caption = formData.get('caption') as string
    const imageUrl = formData.get('imageUrl') as string | null
    const connectedAccountId = formData.get('connectedAccountId') as string

    if (!connectedAccountId) {
        return { error: 'Please select an Instagram account first.' }
    }

    try {
        const post = await prisma.post.create({
            data: {
                userId: session.user.id,
                connectedAccountId,
                caption: caption || '',
                imageUrl: imageUrl || 'https://placeholder.co/1080x1080',
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
    const imageUrl = formData.get('imageUrl') as string | null
    const connectedAccountId = formData.get('connectedAccountId') as string

    if (!connectedAccountId) {
        return { error: 'Please select an Instagram account first.' }
    }
    if (!imageUrl && !formData.get('mediaPreview')) {
        return { error: 'Please upload an image or video before publishing.' }
    }

    try {
        // Create the post first
        const post = await prisma.post.create({
            data: {
                userId: session.user.id,
                connectedAccountId,
                caption: caption || '',
                imageUrl: imageUrl || 'https://placeholder.co/1080x1080',
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
    const imageUrl = formData.get('imageUrl') as string | null
    const connectedAccountId = formData.get('connectedAccountId') as string
    const scheduledForStr = formData.get('scheduledFor') as string

    if (!connectedAccountId) {
        return { error: 'Please select an Instagram account first.' }
    }
    if (!scheduledForStr) {
        return { error: 'Please select a date and time to schedule this post.' }
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
                imageUrl: imageUrl || 'https://placeholder.co/1080x1080',
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
