import { apiError } from '@/lib/api.utils'
import { requireAuth } from '@/lib/auth.utils'
import { toErrorMessage } from '@/lib/api.utils'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params
        const userId = await requireAuth()

        // Find drafts mapped to this project
        // A draft is a post with no schedules and no instagramMediaId
        const drafts = await prisma.post.findMany({
            where: { 
                projectId: params.id,
                userId: userId,
                instagramMediaId: null, // Not published
                schedules: {
                    none: {} // True drafts don't have a schedule entry
                }
            },
            select: {
                id: true,
                imageUrl: true,
                mediaType: true,
                createdAt: true,
                caption: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json({
            drafts
        })
    } catch (error: any) {
        if (error?.isAuthError) return apiError("Unauthorized", 401)
        console.error('[GET /api/projects/[id]/drafts]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
