import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params
        const session = await auth()
        if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 })

        // Find drafts mapped to this project
        // A draft is a post with no schedules and no instagramMediaId
        const drafts = await prisma.post.findMany({
            where: { 
                projectId: params.id,
                userId: session.user.id,
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
    } catch (error) {
        console.error('[GET /api/projects/[id]/drafts]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
