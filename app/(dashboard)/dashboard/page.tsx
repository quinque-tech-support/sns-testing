import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { facebookService } from '@/lib/facebook.service'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
    Eye,
    TrendingUp,
    Bookmark,
    Heart,
    MoreHorizontal,
    ArrowUpRight,
    ArrowDownRight,
    PlayCircle,
    CheckCircle2,
    Clock,
    UserPlus,
    MessageCircle,
    Instagram,
    Plus,
    Calendar
} from 'lucide-react'

export default async function DashboardPage() {
    const session = await auth()
    if (!session?.user?.id) {
        redirect('/signin')
    }

    // Fetch dynamic stats
    const [accountsCount, publishedCount, connectedAccount] = await Promise.all([
        prisma.connectedAccount.count({ where: { userId: session.user.id } }),
        prisma.schedule.count({
            where: {
                post: { userId: session.user.id },
                status: 'PUBLISHED'
            }
        }),
        prisma.connectedAccount.findFirst({
            where: {
                userId: session.user.id,
            },
            select: {
                instagramBusinessId: true,
                pageAccessToken: true,
                username: true,
            }
        })
    ])

    // Fetch real-time Instagram account insights (last 30 days)
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

    function formatNum(n: number): string {
        if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
        if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
        return n.toString()
    }

    const kpis = [
        {
            label: 'Reach (30 days)',
            value: hasInsights ? formatNum(totalImpressions) : '--',
            sub: hasInsights ? 'Unique accounts reached' : 'Connect an account',
            icon: Eye,
            color: 'text-blue-500',
            bg: 'bg-blue-50',
            trend: hasInsights ? '↑ Live' : null,
            isPositive: true,
        },
        {
            label: 'Profile Views (30 days)',
            value: hasInsights ? formatNum(totalLikes) : '--',
            sub: hasInsights ? 'From Instagram Graph API' : 'No data yet',
            icon: Heart,
            color: 'text-pink-500',
            bg: 'bg-pink-50',
            trend: hasInsights ? '↑ Live' : null,
            isPositive: true,
        },
        {
            label: 'Published Posts',
            value: publishedCount.toString(),
            sub: 'All time',
            icon: PlayCircle,
            color: 'text-purple-500',
            bg: 'bg-purple-50',
            trend: publishedCount > 0 ? `+${publishedCount}` : null,
            isPositive: true,
        },
        {
            label: 'Linked Accounts',
            value: accountsCount.toString(),
            sub: connectedAccount ? `@${connectedAccount.username}` : 'No accounts',
            icon: UserPlus,
            color: 'text-orange-500',
            bg: 'bg-orange-50',
            trend: accountsCount > 0 ? `${accountsCount} active` : null,
            isPositive: true,
        },
    ]

    // Fetch upcoming posts
    const upcomingSchedules = await prisma.schedule.findMany({
        where: {
            post: { userId: session.user.id },
            status: 'PENDING'
        },
        include: { post: true },
        orderBy: { scheduledFor: 'asc' },
        take: 3
    })

    const activities = [
        { id: 1, type: 'status_change', user: 'System', detail: hasInsights ? `Synced @${connectedAccount?.username} insights` : 'Waiting for connected account...', time: 'Live', icon: CheckCircle2, iconColor: 'text-green-500' },
        { id: 2, type: 'post_published', user: 'Queue', detail: `${publishedCount} posts published`, time: 'All time', icon: PlayCircle, iconColor: 'text-purple-500' },
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Greeting */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-gray-500 mt-1">Welcome back, {session.user?.name || 'User'}! Here's what's happening with your accounts.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">Last 7 Days</span>
                    <button className="p-2 hover:bg-white rounded-lg border border-gray-200 shadow-sm transition-all">
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi) => (
                    <div key={kpi.label} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                        <div className={`absolute top-0 right-0 w-24 h-24 ${kpi.bg} rounded-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform duration-500`} />

                        <div className="relative">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-10 h-10 ${kpi.bg} rounded-xl flex items-center justify-center`}>
                                    <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                                </div>
                                {kpi.trend && (
                                    <div className="flex items-center gap-1 text-xs font-bold text-green-600">
                                        <ArrowUpRight className="w-3 h-3" />
                                        {kpi.trend}
                                    </div>
                                )}
                            </div>
                            <h3 className="text-sm font-medium text-gray-500 truncate">{kpi.label}</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
                            {kpi.sub && <p className="text-xs text-gray-400 mt-1 truncate">{kpi.sub}</p>}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Performance Chart Mockup */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Performance Trend</h2>
                            <p className="text-sm text-gray-500 mt-0.5">Views vs. Engagement over time</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                                <span className="text-xs font-medium text-gray-600">Views</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-pink-400" />
                                <span className="text-xs font-medium text-gray-600">Engagement</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[300px] w-full flex items-end justify-between gap-1 mt-4 px-2">
                        {[40, 60, 45, 90, 65, 80, 50, 75, 40, 95, 70, 85].map((val, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                <div className="w-full relative flex items-end">
                                    <div
                                        style={{ height: `${val}%` }}
                                        className="w-full bg-purple-500/10 group-hover:bg-purple-500/20 rounded-t-sm transition-all"
                                    />
                                    <div
                                        style={{ height: `${val * 0.4}%` }}
                                        className="absolute bottom-0 w-full bg-purple-500/40 group-hover:bg-purple-500 rounded-t-sm transition-all"
                                    />
                                </div>
                                <span className="text-[10px] text-gray-400 font-medium">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i % 7]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Posts */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Upcoming</h2>
                        <Link href="/calendar" className="text-xs font-bold text-purple-600 hover:text-purple-700">View Calendar</Link>
                    </div>

                    <div className="space-y-4 flex-1">
                        {upcomingSchedules.length > 0 ? upcomingSchedules.map((schedule) => (
                            <div key={schedule.id} className="flex gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all group">
                                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-gray-100 bg-gray-50 flex items-center justify-center">
                                    <img src={schedule.post.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded uppercase tracking-wider">Scheduled</span>
                                    </div>
                                    <h4 className="text-sm font-bold text-gray-900 truncate uppercase tracking-tight">{schedule.post.caption || 'No Caption'}</h4>
                                    <div className="flex items-center gap-1.5 mt-1 text-gray-500">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span className="text-xs">{new Date(schedule.scheduledFor).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4 border-2 border-dashed border-gray-100 rounded-2xl">
                                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No Posts Scheduled</p>
                            </div>
                        )}
                    </div>

                    <Link href="/create" className="w-full mt-6 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold border border-transparent hover:bg-purple-700 transition-all text-center shadow-lg shadow-purple-600/10 active:scale-95">
                        Schedule New Post
                    </Link>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Activity Feed */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                        <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal className="w-5 h-5" /></button>
                    </div>

                    <div className="space-y-6">
                        {activities.map((activity) => (
                            <div key={activity.id} className="flex gap-4">
                                <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center bg-gray-50`}>
                                    <activity.icon className={`w-5 h-5 ${activity.iconColor}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        <span className="font-bold text-gray-900">{activity.user}</span> {activity.detail}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Account Status Card */}
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-8 rounded-3xl shadow-lg shadow-purple-500/20 relative overflow-hidden group min-h-[300px]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform duration-700" />

                    <div className="relative flex flex-col h-full">
                        <div className="flex items-start justify-between">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                                <Instagram className="w-6 h-6 text-white" />
                            </div>
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-widest border border-white/30">
                                {accountsCount > 0 ? 'Connected' : 'Disconnected'}
                            </span>
                        </div>

                        <div className="mt-8">
                            <h3 className="text-2xl font-bold text-white">Accounts Linked</h3>
                            <p className="text-purple-100/80 text-sm mt-1">Manage from your account settings</p>
                        </div>

                        <div className="mt-auto pt-10 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-purple-100/60 uppercase tracking-widest">Total Accounts</p>
                                <p className="text-xl font-bold text-white">{accountsCount}</p>
                            </div>
                            <Link href="/account" className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-xs font-bold text-white uppercase tracking-widest border border-white/20 transition-all">
                                Manage
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
