import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params
        const session = await auth()
        if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 })

        // Find posts mapped to this project that actually have an image
        const posts = await prisma.post.findMany({
            where: { 
                projectId: params.id,
                userId: session.user.id,
                // Only consider posts with successfully stored media
                imageUrl: { not: '' }
            },
            select: {
                id: true,
                imageUrl: true,
                mediaType: true,
                createdAt: true,
                likes: true,
                views: true,
                reach: true,
                saves: true,
                caption: true,
            }
        })

        // Sort posts by engagement (likes + views + reach + saves) descending
        posts.sort((a, b) => {
            const scoreA = (a.likes || 0) + (a.views || 0) + (a.reach || 0) + (a.saves || 0)
            const scoreB = (b.likes || 0) + (b.views || 0) + (b.reach || 0) + (b.saves || 0)
            
            if (scoreA !== scoreB) {
                return scoreB - scoreA // Descending by score
            }
            // Tie-breaker: newest first
            return b.createdAt.getTime() - a.createdAt.getTime()
        })

        return NextResponse.json({
            history: posts
        })
    } catch (error) {
        console.error('[GET /api/projects/[id]/history]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
