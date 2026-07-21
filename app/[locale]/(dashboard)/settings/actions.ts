'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth.utils'
import { ActionResult } from '@/lib/types'

export async function updateAiUsageOption(option: string): Promise<ActionResult> {
    try {
        const userId = await requireAuth()

        await prisma.user.update({
            where: { id: userId },
            data: { aiUsageOption: option }
        })
        revalidatePath('/settings')
        return { success: true }
    } catch (e: any) {
        if (e.isAuthError) return { error: 'Not authenticated' }
        console.error('[updateAiUsageOption]', e)
        return { error: 'Failed to update AI setting' }
    }
}

import { hash } from 'bcryptjs'

export async function updateProfile(data: { name?: string, newPassword?: string, avatarUrl?: string }): Promise<ActionResult> {
    try {
        const userId = await requireAuth()
        
        const updateData: any = {}
        if (data.name !== undefined) updateData.name = data.name
        if (data.avatarUrl !== undefined) updateData.image = data.avatarUrl
        if (data.newPassword) {
            updateData.password_hash = await hash(data.newPassword, 10)
        }

        await prisma.user.update({
            where: { id: userId },
            data: updateData
        })
        
        revalidatePath('/settings')
        return { success: true }
    } catch (e: any) {
        if (e.isAuthError) return { error: 'Not authenticated' }
        console.error('[updateProfile]', e)
        return { error: 'Failed to update profile' }
    }
}

export async function deleteProfile(): Promise<ActionResult> {
    try {
        const userId = await requireAuth()
        await prisma.user.delete({
            where: { id: userId }
        })
        return { success: true }
    } catch (e: any) {
        if (e.isAuthError) return { error: 'Not authenticated' }
        console.error('[deleteProfile]', e)
        return { error: 'Failed to delete profile' }
    }
}
