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
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            trend: hasInsights ? '↑ Live' : null,
            isPositive: true,
        },
        {
            label: 'Profile Views (30 days)',
            value: hasInsights ? formatNum(totalLikes) : '--',
            sub: hasInsights ? 'From Instagram API' : 'No data yet',
            icon: Heart,
            color: 'text-pink-600',
            bg: 'bg-pink-50',
            trend: hasInsights ? '↑ Live' : null,
            isPositive: true,
        },
        {
            label: 'Published Posts',
            value: publishedCount.toString(),
            sub: 'All time automatically',
            icon: PlayCircle,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            trend: publishedCount > 0 ? `+${publishedCount}` : null,
            isPositive: true,
        },
        {
            label: 'Linked Accounts',
            value: accountsCount.toString(),
            sub: connectedAccount ? `@${connectedAccount.username}` : 'No accounts',
            icon: UserPlus,
            color: 'text-orange-600',
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
        { id: 1, type: 'status_change', user: 'System', detail: hasInsights ? `Synced @${connectedAccount?.username} insights` : 'Waiting for connected account...', time: 'Live', icon: CheckCircle2, iconColor: 'text-green-600' },
        { id: 2, type: 'post_published', user: 'Queue', detail: `${publishedCount} posts published`, time: 'All time', icon: PlayCircle, iconColor: 'text-purple-600' },
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
            {/* Greeting */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Dashboard Overview</h1>
                    <p className="text-gray-500 font-medium mt-1">Welcome back, {session.user?.name || 'User'}! Here's what's happening with your accounts.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">Last 7 Days</span>
                    <button className="p-2 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 shadow-sm transition-all duration-200 ease-out active:scale-95 group">
                        <MoreHorizontal className="w-4 h-4 text-gray-500 group-hover:text-gray-800" />
                    </button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi) => (
                    <div key={kpi.label} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),_0_1px_2px_0_rgba(0,0,0,0.01)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out group overflow-hidden relative cursor-default">
                        <div className={`absolute top-0 right-0 w-24 h-24 ${kpi.bg} rounded-full -mr-8 -mt-8 opacity-40 group-hover:scale-125 transition-transform duration-700 ease-out`} />

                        <div className="relative">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-10 h-10 ${kpi.bg} rounded-xl flex items-center justify-center shadow-inner`}>
                                    <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                                </div>
                                {kpi.trend && (
                                    <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100/50">
                                        <ArrowUpRight className="w-3.5 h-3.5" />
                                        {kpi.trend}
                                    </div>
                                )}
                            </div>
                            <h3 className="text-sm font-semibold text-gray-600 tracking-tight truncate">{kpi.label}</h3>
                            <p className="text-[28px] leading-tight font-bold text-gray-900 mt-1">{kpi.value}</p>
                            {kpi.sub && <p className="text-sm font-medium text-gray-400 mt-1.5 truncate">{kpi.sub}</p>}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Performance Chart Mockup */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),_0_1px_2px_0_rgba(0,0,0,0.01)]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Performance Trend</h2>
                            <p className="text-sm font-medium text-gray-500 mt-0.5">Views vs. Engagement over time</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded bg-purple-500 shadow-sm" />
                                <span className="text-sm font-medium text-gray-600">Views</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded bg-pink-400 shadow-sm" />
                                <span className="text-sm font-medium text-gray-600">Engagement</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[300px] w-full flex items-end justify-between gap-1.5 mt-4 px-2">
                        {[40, 60, 45, 90, 65, 80, 50, 75, 40, 95, 70, 85].map((val, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                                <div className="w-full relative flex items-end">
                                    <div
                                        style={{ height: `${val}%` }}
                                        className="w-full bg-purple-500/10 group-hover:bg-purple-500/20 rounded-md transition-colors duration-300"
                                    />
                                    <div
                                        style={{ height: `${val * 0.4}%` }}
                                        className="absolute bottom-0 w-full bg-purple-500/50 group-hover:bg-purple-500 rounded-md shadow-sm transition-colors duration-300"
                                    />
                                </div>
                                <span className="text-xs text-gray-400 font-semibold uppercase">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i % 7]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Posts */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),_0_1px_2px_0_rgba(0,0,0,0.01)] flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900 tracking-tight">Upcoming</h2>
                        <Link href="/calendar" className="text-sm font-semibold text-purple-600 hover:text-purple-700 active:scale-95 transition-all">View Calendar</Link>
                    </div>

                    <div className="space-y-4 flex-1">
                        {upcomingSchedules.length > 0 ? upcomingSchedules.map((schedule) => (
                            <div key={schedule.id} className="flex gap-4 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all duration-200 group cursor-pointer">
                                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-200 bg-gray-50 flex items-center justify-center shadow-sm">
                                    <img src={schedule.post.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full uppercase tracking-widest shadow-sm">Scheduled</span>
                                    </div>
                                    <h4 className="text-sm font-semibold text-gray-900 truncate tracking-tight">{schedule.post.caption || 'No Caption'}</h4>
                                    <div className="flex items-center gap-1.5 mt-1 text-gray-500">
                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="text-xs font-medium">{new Date(schedule.scheduledFor).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-gray-400">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-700">No Posts Scheduled</p>
                                    <p className="text-xs text-gray-500 mt-1">Get ahead of your content</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <Link href="/create" className="w-full mt-6 py-3 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-600/20 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 text-center">
                        Schedule New Post
                    </Link>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Activity Feed */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),_0_1px_2px_0_rgba(0,0,0,0.01)]">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900 tracking-tight">Recent Activity</h2>
                        <button className="text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-50 p-2 rounded-lg transition-colors"><MoreHorizontal className="w-5 h-5" /></button>
                    </div>

                    <div className="space-y-6">
                        {activities.map((activity) => (
                            <div key={activity.id} className="flex gap-4">
                                <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center bg-gray-50 border border-gray-100 shadow-sm`}>
                                    <activity.icon className={`w-5 h-5 ${activity.iconColor}`} />
                                </div>
                                <div className="flex-1 min-w-0 pt-0.5">
                                    <p className="text-sm font-medium text-gray-600 leading-snug">
                                        <span className="font-semibold text-gray-900">{activity.user}</span> {activity.detail}
                                    </p>
                                    <p className="text-xs font-medium text-gray-400 mt-1.5">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Account Status Card - Premium Glassmorphic Update */}
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-8 rounded-3xl shadow-[0_8px_30px_rgb(217,70,239,0.2)] ring-1 ring-white/20 relative overflow-hidden group min-h-[300px]">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/20 rounded-full -mr-48 -mt-48 blur-3xl group-hover:scale-110 group-hover:bg-white/30 transition-all duration-700 ease-out" />
                    
                    {/* Inner glass highlight */}
                    <div className="absolute inset-0 rounded-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] pointer-events-none" />

                    <div className="relative flex flex-col h-full z-10">
                        <div className="flex items-start justify-between">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                                <Instagram className="w-7 h-7 text-white" />
                            </div>
                            <span className="px-3.5 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold text-white uppercase tracking-wider border border-white/30 shadow-sm">
                                {accountsCount > 0 ? 'Connected' : 'Disconnected'}
                            </span>
                        </div>

                        <div className="mt-8">
                            <h3 className="text-3xl font-bold text-white tracking-tight">Accounts Linked</h3>
                            <p className="text-white/80 font-medium text-sm mt-1.5">Manage from your account settings</p>
                        </div>

                        <div className="mt-auto pt-10 flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold text-white/70 uppercase tracking-widest mb-1">Total Accounts</p>
                                <p className="text-3xl font-bold text-white tracking-tight drop-shadow-sm">{accountsCount}</p>
                            </div>
                            <Link href="/account" className="px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-sm font-semibold text-white border border-white/30 shadow-sm transition-all duration-200 active:scale-[0.98]">
                                Manage
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
