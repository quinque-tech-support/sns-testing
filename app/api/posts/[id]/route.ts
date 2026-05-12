import { requireAuth } from '@/lib/auth.utils'
import { prisma } from '@/lib/prisma'
import { apiError, apiSuccess } from '@/lib/api.utils'

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await requireAuth()
        const { id } = await params

        const post = await prisma.post.findUnique({
            where: { id, userId },
            select: {
                id: true,
                caption: true,
                imageUrl: true,
                mediaType: true,
                connectedAccountId: true,
                projectId: true,
                schedules: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: { status: true, scheduledFor: true },
                },
            },
        })

        if (!post) return apiError('Post not found', 404)

        return apiSuccess(post)
    } catch (error: any) {
        if (error?.isAuthError) return apiError('Unauthorized', 401)
        return apiError('Failed to fetch post', 500)
    }
}

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await requireAuth()
        const { id } = await params

        const post = await prisma.post.findUnique({
            where: { id },
            select: {
                userId: true,
                schedules: { select: { status: true } },
            },
        })

        if (!post || post.userId !== userId) {
            return apiError('Post not found', 404)
        }

        // Block deletion of published posts — they live on Instagram
        const hasPublished = post.schedules.some(s => s.status === 'PUBLISHED')
        if (hasPublished) {
            return apiError('Published posts cannot be deleted', 403)
        }

        await prisma.post.delete({ where: { id } })
        return apiSuccess({ deleted: true })
    } catch (error: any) {
        if (error?.isAuthError) return apiError('Unauthorized', 401)
        return apiError('Failed to delete post', 500)
    }
}
