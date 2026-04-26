import { requirePageAuth } from '@/lib/auth.utils'
import { prisma } from '@/lib/prisma'
import { facebookService } from '@/lib/services/facebook.service'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'



export default async function DashboardPage() {
    const session = await requirePageAuth();
    const userId = session.user.id

    const [accountsCount, publishedCount, connectedAccount] = await Promise.all([
        prisma.connectedAccount.count({ where: { userId: userId } }),
        prisma.schedule.count({ where: { post: { userId: userId }, status: 'PUBLISHED' } }),
        prisma.connectedAccount.findFirst({
            where: { userId: userId },
            select: { instagramBusinessId: true, pageAccessToken: true, username: true },
        }),
    ])

    let totalImpressions = 0
    let totalLikes = 0
    let hasInsights = false

    if (connectedAccount?.instagramBusinessId && connectedAccount?.pageAccessToken) {
        const insights = await facebookService.getAccountInsights(
            connectedAccount.instagramBusinessId,
            connectedAccount.pageAccessToken
        )
        if (insights) {
            totalImpressions = insights.totalImpressions
            totalLikes = insights.totalLikes
            hasInsights = true
        }
    }



    const upcomingSchedules = await prisma.schedule.findMany({
        where: { post: { userId: userId }, status: 'PENDING' },
        include: { post: true },
        orderBy: { scheduledFor: 'asc' },
        take: 3,
    })

    const recentPosts = await prisma.post.findMany({
        where: { userId: userId, schedules: { some: { status: 'PUBLISHED' } } },
        include: { schedules: true },
        orderBy: { createdAt: 'desc' },
        take: 50,
    })

    const chartDays = 12
    const chartData = Array.from({ length: chartDays }).map((_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (chartDays - 1 - i))
        d.setHours(0, 0, 0, 0)
        return { date: d, label: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()], views: 0, engagement: 0 }
    })

    recentPosts.forEach(post => {
        const pubSchedule = post.schedules.find(s => s.status === 'PUBLISHED')
        if (pubSchedule) {
            const pubDate = new Date(pubSchedule.scheduledFor)
            pubDate.setHours(0, 0, 0, 0)
            const dayObj = chartData.find(d => d.date.getTime() === pubDate.getTime())
            if (dayObj) {
                dayObj.views += post.views > 0 ? post.views : post.reach
                dayObj.engagement += (post.likes + post.saves)
            }
        }
    })

    const maxViews = Math.max(...chartData.map(d => d.views), 10)
    const useRealData = chartData.some(d => d.views > 0)

    return (
        <DashboardClient
            userName={session.user?.name}
            upcomingSchedules={upcomingSchedules}
            chartData={chartData}
            maxViews={maxViews}
            useRealData={useRealData}
            hasInsights={hasInsights}
            totalImpressions={totalImpressions}
            totalLikes={totalLikes}
            publishedCount={publishedCount}
            accountsCount={accountsCount}
            connectedAccountUsername={connectedAccount?.username || null}
        />
    )
}
