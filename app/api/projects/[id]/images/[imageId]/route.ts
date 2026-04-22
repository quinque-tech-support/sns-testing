import { apiError } from '@/lib/api.utils'
import { requireAuth } from '@/lib/auth.utils'
import { toErrorMessage } from '@/lib/api.utils'
import { prisma } from '@/lib/prisma'
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

type RouteProps = { params: Promise<{ id: string; imageId: string }> }

/** DELETE /api/projects/[id]/images/[imageId]
 *  Deletes the ProjectImage DB record AND the file from Supabase Storage.
 */
export async function DELETE(_req: Request, { params }: RouteProps) {
    try {
        const { id: projectId, imageId } = await params
        const userId = await requireAuth()

        // Find the image and verify ownership atomically
        const image = await prisma.projectImage.findUnique({
            where: { id: imageId },
        })
        
        if (!image || image.userId !== userId || image.projectId !== projectId) {
            return new NextResponse('Not Found', { status: 404 })
        }

        // 1. Delete the file from Supabase Storage
        const { error: storageError } = await supabaseAdmin.storage
            .from('media-uploads')
            .remove([image.storagePath])

        if (storageError) {
            // Log but don't fail — the DB record must still be cleaned up
            console.error('[DELETE image] Supabase storage removal failed:', storageError)
        }

        // 2. Delete the DB record
        await prisma.projectImage.delete({ where: { id: imageId } })

        return new NextResponse(null, { status: 204 })
    } catch (error: any) {
        if (error?.isAuthError) return apiError("Unauthorized", 401)
        console.error('[DELETE /api/projects/[id]/images/[imageId]]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
