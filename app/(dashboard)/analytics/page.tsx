import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import {
    BarChart3,
    Download,
    TrendingUp,
    Users,
    MousePointer2,
    Share2,
    Heart,
    Bookmark,
    Eye,
    ChevronDown,
    Calendar,
    ArrowUpRight,
    Play,
    Instagram,
    Clock
} from 'lucide-react'

export const dynamic = 'force-dynamic'

function formatNumber(n: number): string {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
    return n.toString()
}

interface ChartDataPoint {
    label: string
    count: number
    publishedCount: number
    height: number
    pubHeight: number
}

function get30DayActivityData(posts: { createdAt: Date, schedules: { status: string }[] }[]): ChartDataPoint[] {
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

        data.push({
            // Only show label every 6 days
            label: (i % 6 === 0) ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
            count,
            publishedCount,
            height: 0,
            pubHeight: 0
        })
    }

    const maxCount = Math.max(...data.map(d => d.count), 1)

    return data.map(d => ({
        ...d,
        height: Math.max(2, (d.count / maxCount) * 100),
        pubHeight: Math.max(0, (d.publishedCount / maxCount) * 100)
    }))
}

export default async function AnalyticsPage() {
    const session = await auth()
    if (!session?.user?.id) {
        redirect('/signin')
    }

    const [
        postsCount,
        publishedCount,
        pendingCount,
        accountsCount,
        topPosts
    ] = await Promise.all([
        prisma.post.count({ where: { userId: session.user.id } }),
        prisma.schedule.count({
            where: {
                post: { userId: session.user.id },
                status: 'PUBLISHED'
            }
        }),
        prisma.schedule.count({
            where: {
                post: { userId: session.user.id },
                status: 'PENDING'
            }
        }),
        prisma.connectedAccount.count({ where: { userId: session.user.id } }),
        prisma.post.findMany({
            where: { userId: session.user.id },
            include: {
                schedules: { orderBy: { createdAt: 'desc' }, take: 1 },
                connectedAccount: { select: { username: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 4
        }),
        prisma.post.findMany({
            where: {
                userId: session.user.id,
                createdAt: {
                    gte: new Date(new Date().setDate(new Date().getDate() - 30))
                }
            },
            select: {
                createdAt: true,
                schedules: { select: { status: true } }
            }
        })
    ])

    const stats = [
        { label: 'Total Posts', value: formatNumber(postsCount), trend: postsCount > 0 ? '+' + postsCount : '0', icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Published', value: formatNumber(publishedCount), trend: publishedCount > 0 ? '+' + publishedCount : '0', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Scheduled', value: formatNumber(pendingCount), trend: pendingCount > 0 ? '+' + pendingCount : '0', icon: Clock, color: 'text-pink-600', bg: 'bg-pink-50' },
        { label: 'Linked Accounts', value: formatNumber(accountsCount), trend: accountsCount > 0 ? '+' + accountsCount : '0', icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
    ]

    const engagementData = [
        { label: 'Posts Created', value: postsCount, max: Math.max(postsCount, 1), color: 'bg-pink-500', icon: Heart },
        { label: 'Published', value: publishedCount, max: Math.max(postsCount, 1), color: 'bg-orange-500', icon: Bookmark },
        { label: 'Scheduled', value: pendingCount, max: Math.max(postsCount, 1), color: 'bg-blue-500', icon: Share2 },
    ]

    const chartData = get30DayActivityData(postsCount > 0 ? (await prisma.post.findMany({
        where: {
            userId: session.user.id,
            createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) }
        },
        select: { createdAt: true, schedules: { select: { status: true } } }
    })) : [])

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics Insights</h1>
                    <p className="text-gray-500 mt-1">Deep dive into your content performance and audience growth.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl shadow-sm text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-50 transition-all">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        Last 30 Days
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 instagram-gradient text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-500/20 hover:opacity-90 active:scale-95 transition-all">
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between relative z-10">
                            <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold ${stat.trend.startsWith('+') && stat.trend !== '+0' ? 'text-green-600' : 'text-gray-400'}`}>
                                <TrendingUp className="w-3 h-3" />
                                {stat.trend}
                            </div>
                        </div>
                        <div className="mt-4 relative z-10">
                            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                        </div>
                        <div className={`absolute -bottom-2 -right-2 w-24 h-24 ${stat.bg} rounded-full opacity-20 group-hover:scale-125 transition-transform duration-500`} />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Views & Reach Graph */}
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Activity Overview</h2>
                            <p className="text-sm text-gray-500 mt-1">Post creation activity over the last 30 days.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-purple-500" />
                                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Posts</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-blue-400" />
                                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Published</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[280px] w-full mt-8 relative">
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                            {[1, 2, 3, 4].map(i => <div key={i} className="border-t border-gray-400 w-full h-[1px]" />)}
                        </div>
                        <div className="absolute inset-0 flex items-end justify-between gap-1 pb-1">
                            {chartData.map((day, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                                    <div className="w-full relative flex items-end justify-center h-full">
                                        {/* Total Posts Bar */}
                                        <div
                                            style={{ height: `${day.height}%` }}
                                            className="w-full bg-purple-500/10 group-hover:bg-purple-500/20 rounded-t-sm transition-all"
                                        />
                                        {/* Published Posts Bar (overlays) */}
                                        <div
                                            style={{ height: `${day.pubHeight}%` }}
                                            className="absolute bottom-0 w-full bg-blue-500/50 group-hover:bg-blue-500 rounded-t-sm transition-all shadow-[0_0_10px_rgba(96,165,250,0.5)] group-hover:shadow-[0_0_15px_rgba(96,165,250,0.8)]"
                                        />

                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all shadow-xl z-20 whitespace-nowrap hidden group-hover:block">
                                            {day.count} Posts ({day.publishedCount} Pub)
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-between mt-4 px-2">
                        {chartData.filter(d => d.label).map((d, i) => (
                            <span key={i} className="text-[10px] font-bold text-gray-400 uppercase">{d.label}</span>
                        ))}
                    </div>
                </div>

                {/* Engagement Breakdown */}
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Content Breakdown</h2>
                            <p className="text-sm text-gray-500 mt-1">Comparing created, published, and scheduled posts.</p>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50 px-2 py-1 rounded">
                            Total: {postsCount}
                        </div>
                    </div>

                    <div className="space-y-8 mt-10">
                        {engagementData.map((item) => {
                            const pct = item.max > 0 ? Math.round((item.value / item.max) * 100) : 0
                            return (
                                <div key={item.label} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm font-bold">
                                        <div className="flex items-center gap-2">
                                            <item.icon className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-700">{item.label}</span>
                                        </div>
                                        <span className="text-gray-900">{item.value}</span>
                                    </div>
                                    <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                                        <div
                                            style={{ width: `${pct}%` }}
                                            className={`${item.color} h-full rounded-full transition-all duration-1000 animate-in slide-in-from-left shadow-sm`}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="mt-12 p-4 bg-purple-50 rounded-2xl border border-purple-100 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-purple-900">Account Summary</p>
                            <p className="text-xs text-purple-700 mt-0.5">
                                {postsCount === 0
                                    ? 'No posts yet. Create your first post to get started!'
                                    : `You have ${publishedCount} published and ${pendingCount} scheduled posts across ${accountsCount} account${accountsCount !== 1 ? 's' : ''}.`
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Performing Posts */}
            <div id="recent-posts" className="scroll-mt-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900 px-1">Recent Posts</h2>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{postsCount} total</span>
                </div>

                {topPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {topPosts.map((post) => {
                            const schedule = post.schedules[0]
                            const statusLabel = schedule
                                ? schedule.status === 'PUBLISHED' ? 'Published'
                                    : schedule.status === 'PENDING' ? 'Scheduled'
                                        : schedule.status === 'FAILED' ? 'Failed'
                                            : 'Processing'
                                : 'Draft'

                            return (
                                <div key={post.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:border-purple-200 hover:shadow-md transition-all">
                                    <div className="aspect-square relative overflow-hidden bg-gray-100">
                                        <img
                                            src={post.imageUrl}
                                            alt={post.caption || 'Post'}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute top-3 left-3 flex gap-1.5">
                                            <div className="px-2 py-1 bg-black/50 backdrop-blur-md rounded-lg flex items-center gap-1 border border-white/20">
                                                <Instagram className="w-3 h-3 text-white" />
                                                <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                                                    {post.connectedAccount?.username ? `@${post.connectedAccount.username}` : 'Post'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                            <div className="flex items-center justify-between text-white">
                                                <div className="flex items-center gap-1.5">
                                                    <Eye className="w-4 h-4" />
                                                    <span className="text-xs font-bold">{statusLabel}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <ArrowUpRight className="w-4 h-4" />
                                                    <span className="text-xs font-bold">
                                                        {schedule ? new Date(schedule.scheduledFor ?? post.createdAt).toLocaleDateString() : new Date(post.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-left">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</p>
                                                <p className={`text-sm font-bold mt-1 ${statusLabel === 'Published' ? 'text-green-600' : statusLabel === 'Scheduled' ? 'text-purple-600' : statusLabel === 'Failed' ? 'text-red-600' : 'text-gray-500'}`}>
                                                    {statusLabel}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Created</p>
                                                <p className="text-sm font-bold text-gray-900 mt-1">
                                                    {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                        {post.caption && (
                                            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 italic">
                                                "{post.caption}"
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border-2 border-dashed border-gray-100 p-16 text-center">
                        <div className="w-14 h-14 instagram-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20">
                            <BarChart3 className="w-7 h-7 text-white" />
                        </div>
                        <p className="text-base font-bold text-gray-900">No posts yet</p>
                        <p className="text-sm text-gray-400 mt-1">Create and schedule your first post to see analytics here.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
