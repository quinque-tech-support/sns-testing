import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
    ListChecks,
    PlusCircle,
    Clock,
    CheckCircle2,
    FileText,
    XCircle,
    Instagram,
    Image as ImageIcon,
    Video,
    Calendar,
    ArrowRight,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

const statusConfig = {
    DRAFT: { label: 'Draft', color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', dot: 'bg-gray-400', icon: FileText },
    PENDING: { label: 'Scheduled', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', dot: 'bg-purple-500', icon: Clock },
    PUBLISHED: { label: 'Published', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', dot: 'bg-green-500', icon: CheckCircle2 },
    FAILED: { label: 'Failed', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', dot: 'bg-red-500', icon: XCircle },
    PROCESSING: { label: 'Processing', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', dot: 'bg-blue-500', icon: Clock },
} as const

type StatusKey = keyof typeof statusConfig

interface Post {
    id: string
    caption: string | null
    imageUrl: string
    mediaType: string
    createdAt: Date
    instagramMediaId: string | null
    connectedAccount: { username: string | null } | null
    schedules: { status: string; scheduledFor: Date }[]
}

function getPostStatus(post: Post): StatusKey {
    const latest = post.schedules[0]
    if (!latest) return 'DRAFT'
    return latest.status as StatusKey
}

export default async function WorkflowPage() {
    const session = await auth()
    if (!session?.user?.id) redirect('/signin')

    const posts = await prisma.post.findMany({
        where: { userId: session.user.id },
        include: {
            schedules: { orderBy: { createdAt: 'desc' }, take: 1 },
            connectedAccount: { select: { username: true } },
        },
        orderBy: { createdAt: 'desc' },
    })

    const groups: Record<StatusKey, Post[]> = {
        DRAFT: [],
        PENDING: [],
        PUBLISHED: [],
        FAILED: [],
        PROCESSING: [],
    }

    for (const post of posts) {
        const status = getPostStatus(post as Post)
        groups[status].push(post as Post)
    }

    const totalPosts = posts.length
    const columns: StatusKey[] = ['DRAFT', 'PENDING', 'PUBLISHED', 'FAILED']

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Workflow</h1>
                    <p className="text-gray-500 mt-1">
                        {totalPosts > 0
                            ? `${totalPosts} post${totalPosts === 1 ? '' : 's'} across all stages`
                            : 'No posts yet. Create your first post to get started.'
                        }
                    </p>
                </div>
                <Link
                    href="/create"
                    className="flex items-center gap-2 px-6 py-3 instagram-gradient text-white rounded-xl font-bold shadow-lg shadow-purple-500/20 hover:opacity-90 transition-all duration-200 ease-out active:scale-95 hover:shadow-xl hover:-translate-y-0.5 w-fit"
                >
                    <PlusCircle className="w-4 h-4" />
                    Create New Post
                </Link>
            </div>

            {/* Summary Pills */}
            <div className="flex flex-wrap gap-3">
                {columns.map((key) => {
                    const cfg = statusConfig[key]
                    const Icon = cfg.icon
                    return (
                        <div key={key} className={`flex items-center gap-2 px-4 py-2 ${cfg.bg} border ${cfg.border} rounded-xl`}>
                            <Icon className={`w-4 h-4 ${cfg.color}`} />
                            <span className={`text-sm font-bold ${cfg.color}`}>{cfg.label}</span>
                            <span className={`text-sm font-black ${cfg.color}`}>{groups[key].length}</span>
                        </div>
                    )
                })}
            </div>

            {/* Kanban Board */}
            {totalPosts === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-100 p-20 text-center">
                    <div className="w-14 h-14 instagram-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20">
                        <ListChecks className="w-7 h-7 text-white" />
                    </div>
                    <p className="text-base font-bold text-gray-900">Your workflow is empty</p>
                    <p className="text-sm text-gray-400 mt-1 mb-6">Create your first post to see it tracked here.</p>
                    <Link href="/create" className="inline-flex items-center gap-2 px-6 py-3 instagram-gradient text-white rounded-xl font-bold shadow-lg shadow-purple-500/20 hover:opacity-90 transition-all duration-200 ease-out active:scale-95 hover:shadow-xl hover:-translate-y-0.5">
                        <PlusCircle className="w-4 h-4" />
                        Create Post
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                    {columns.map((key) => {
                        const cfg = statusConfig[key]
                        const Icon = cfg.icon
                        const colPosts = groups[key]
                        return (
                            <div key={key} className="space-y-3">
                                {/* Column Header */}
                                <div className={`flex items-center justify-between px-4 py-3 ${cfg.bg} border ${cfg.border} rounded-xl`}>
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                                        <span className={`text-sm font-black uppercase tracking-wider ${cfg.color}`}>{cfg.label}</span>
                                    </div>
                                    <span className={`text-xs font-black ${cfg.color} bg-white/60 px-2 py-0.5 rounded-full`}>{colPosts.length}</span>
                                </div>

                                {/* Post Cards */}
                                <div className="space-y-3">
                                    {colPosts.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center gap-2 p-8 bg-white border border-dashed border-gray-100 rounded-2xl text-center">
                                            <Icon className="w-6 h-6 text-gray-200" />
                                            <p className="text-xs font-semibold text-gray-300">No {cfg.label.toLowerCase()} posts</p>
                                        </div>
                                    ) : (
                                        colPosts.map((post) => {
                                            const schedule = post.schedules[0]
                                            const isVideo = post.mediaType === 'VIDEO'
                                            return (
                                                <div key={post.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:border-purple-200 hover:shadow-md transition-all">
                                                    {/* Thumbnail */}
                                                    <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                                                        {isVideo ? (
                                                            <div className="w-full h-full bg-gray-900 flex items-center justify-center relative">
                                                                <img src={post.imageUrl} alt="" className="w-full h-full object-cover opacity-50" />
                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                    <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur flex items-center justify-center">
                                                                        <Video className="w-5 h-5 text-white" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <img
                                                                src={post.imageUrl}
                                                                alt={post.caption || 'Post'}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                            />
                                                        )}
                                                        {/* Account badge */}
                                                        {post.connectedAccount?.username && (
                                                            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg border border-white/20">
                                                                <Instagram className="w-2.5 h-2.5 text-white" />
                                                                <span className="text-[9px] font-bold text-white">@{post.connectedAccount.username}</span>
                                                            </div>
                                                        )}
                                                        {/* Media type badge */}
                                                        <div className="absolute top-2 right-2">
                                                            <div className="w-6 h-6 rounded-lg bg-black/40 backdrop-blur flex items-center justify-center border border-white/20">
                                                                {isVideo ? <Video className="w-3 h-3 text-white" /> : <ImageIcon className="w-3 h-3 text-white" />}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Card Content */}
                                                    <div className="p-3 space-y-2">
                                                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                                            {post.caption || <span className="text-gray-300 italic">No caption</span>}
                                                        </p>
                                                        {schedule && (
                                                            <div className="flex items-center gap-1 text-gray-400">
                                                                <Calendar className="w-3 h-3" />
                                                                <span className="text-[10px] font-semibold">
                                                                    {new Date(schedule.scheduledFor).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {!schedule && (
                                                            <div className="flex items-center gap-1 text-gray-400">
                                                                <Clock className="w-3 h-3" />
                                                                <span className="text-[10px] font-semibold">
                                                                    {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
