import { requirePageAuth } from '@/lib/auth.utils'
import { prisma } from '@/lib/prisma'
import { facebookService } from '@/lib/services/facebook.service'
import { redirect } from 'next/navigation'
import WorkflowClient from './WorkflowClient'

export const dynamic = 'force-dynamic'

interface Post {
    id: string
    caption: string | null
    imageUrl: string
    mediaType: string
    createdAt: Date
    instagramMediaId: string | null
    connectedAccount: { username: string | null; pageAccessToken: string | null } | null
    schedules: { status: string; scheduledFor: Date }[]
    likes: number
    views: number
    reach: number
    saves: number
}

function getPostStatus(post: Post): string {
    const latest = post.schedules[0]
    if (!latest) return 'DRAFT'
    return latest.status
}

export default async function WorkflowPage() {
    const session = await requirePageAuth();
    const userId = session.user.id

    const posts = await prisma.post.findMany({
        where: { userId: userId },
        include: {
            schedules: { orderBy: { createdAt: 'desc' }, take: 1 },
            connectedAccount: { select: { username: true, pageAccessToken: true } },
        },
        orderBy: { createdAt: 'desc' },
    }) as Post[]

    // Enrich published posts with live insights
    const toSync = posts.filter(p =>
        getPostStatus(p) === 'PUBLISHED' &&
        p.instagramMediaId &&
        !p.instagramMediaId.startsWith('test_') &&
        p.connectedAccount?.pageAccessToken
    )

    // Enrich published posts with live insights asynchronously
    const insightsPromise = (async () => {
        const results: Record<string, { likes: number, views: number }> = {}
        if (toSync.length > 0) {
            await Promise.all(toSync.map(async (p) => {
                try {
                    const insights = await facebookService.getMediaInsights(p.instagramMediaId!, p.connectedAccount!.pageAccessToken!)
                    if (insights) {
                        results[p.id] = { likes: insights.likes, views: insights.views }
                        prisma.post.update({
                            where: { id: p.id },
                            data: { likes: insights.likes, views: insights.views, reach: insights.reach, saves: insights.saves }
                        }).catch(() => {})
                    }
                } catch {
                    // Silently ignore — don't block
                }
            }))
        }
        return results
    })()

    return <WorkflowClient posts={posts} insightsPromise={insightsPromise} />
}
