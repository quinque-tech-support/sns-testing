'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function connectPageById(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) {
        return { error: 'Unauthorized' }
    }

    const pageId = formData.get('pageId') as string
    const username = formData.get('username') as string

    if (!pageId) {
        return { error: 'Page ID is required' }
    }

    try {
        await prisma.connectedAccount.create({
            data: {
                userId: session.user.id,
                facebookUserId: 'manual_' + Date.now(), // Placeholder for manual connection
                pageId: pageId,
                username: username || pageId,
                pageAccessToken: 'manual_token', // Placeholder
                instagramBusinessId: 'manual_ig_' + pageId, // Placeholder
                longLivedUserToken: 'manual_user_token', // Placeholder
                tokenExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
            }
        })

        revalidatePath('/account')
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error: any) {
        console.error('Failed to connect page:', error)
        if (error.code === 'P2002') {
            return { error: 'This page is already connected to your account.' }
        }
        return { error: 'Failed to connect page. Please check the ID.' }
    }
}

export async function disconnectAccount(id: string) {
    const session = await auth()
    if (!session?.user?.id) return { error: 'Unauthorized' }

    try {
        await prisma.connectedAccount.delete({
            where: { id, userId: session.user.id }
        })
        revalidatePath('/account')
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error: any) {
        return { error: 'Failed to disconnect account' }
    }
}
