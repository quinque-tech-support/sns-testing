import { requirePageAuth } from '@/lib/auth.utils'
import { prisma } from '@/lib/prisma'
import { ChartDataPoint } from '@/lib/types'
import AnalyticsClient from './AnalyticsClient'

export const dynamic = 'force-dynamic'

function get30DayActivityData(posts: { createdAt: Date; schedules: { status: string }[] }[]): ChartDataPoint[] {
    const data: ChartDataPoint[] = []
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    for (let i = 29; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(d.getDate() - i)
        const dayPosts = posts.filter(p => {
            const pd = new Date(p.createdAt)
            pd.setHours(0, 0, 0, 0)
            return pd.getTime() === d.getTime()
        })
        const count = dayPosts.length
        const publishedCount = dayPosts.filter(p => p.schedules.some(s => s.status === 'PUBLISHED')).length
        data.push({ label: (i % 6 === 0) ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '', count, publishedCount, height: 0, pubHeight: 0 })
    }

    const maxCount = Math.max(...data.map(d => d.count), 1)
    return data.map(d => ({
        ...d,
        height: Math.max(2, (d.count / maxCount) * 100),
        pubHeight: Math.max(0, (d.publishedCount / maxCount) * 100),
    }))
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function AnalyticsPage() {
    const session = await requirePageAuth();
    const userId = session.user.id

    const [postsCount, publishedCount, pendingCount, accountsCount, topPosts, activityPosts] = await Promise.all([
        prisma.post.count({ where: { userId: userId } }),
        prisma.schedule.count({ where: { post: { userId: userId }, status: 'PUBLISHED' } }),
        prisma.schedule.count({ where: { post: { userId: userId }, status: 'PENDING' } }),
        prisma.connectedAccount.count({ where: { userId: userId } }),
        prisma.post.findMany({
            where: { userId: userId },
            include: { schedules: { orderBy: { createdAt: 'desc' }, take: 1 }, connectedAccount: { select: { username: true } } },
            orderBy: { createdAt: 'desc' },
            take: 4,
        }),
        prisma.post.findMany({
            where: { userId: userId, createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) } },
            select: { createdAt: true, schedules: { select: { status: true } } },
        }),
    ])

    const chartData = get30DayActivityData(activityPosts)

    return (
        <AnalyticsClient
            postsCount={postsCount}
            publishedCount={publishedCount}
            pendingCount={pendingCount}
            accountsCount={accountsCount}
            chartData={chartData}
            topPosts={topPosts}
        />
    )
}
