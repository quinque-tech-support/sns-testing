'use client'

import Link from 'next/link'
import {
    ListChecks, PlusCircle, Clock, CheckCircle2, FileText, XCircle,
    Instagram, Image as ImageIcon, Video, Calendar, Eye, Heart
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

const statusConfig = {
    DRAFT: { label: '下書き', color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', dot: 'bg-gray-400', icon: FileText },
    PENDING: { label: '予約済み', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', dot: 'bg-purple-500', icon: Clock },
    PUBLISHED: { label: '公開済み', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', dot: 'bg-green-500', icon: CheckCircle2 },
    FAILED: { label: '失敗', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', dot: 'bg-red-500', icon: XCircle },
    PROCESSING: { label: '処理中', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', dot: 'bg-blue-500', icon: Clock },
} as const

type StatusKey = keyof typeof statusConfig

interface Post {
    id: string
    caption: string | null
    imageUrl: string
    mediaType: string
    createdAt: Date
    connectedAccount: { username: string | null } | null
    schedules: { status: string; scheduledFor: Date }[]
    likes: number
    views: number
}

interface WorkflowClientProps {
    posts: Post[]
}

function getPostStatus(post: Post): StatusKey {
    const latest = post.schedules[0]
    if (!latest) return 'DRAFT'
    return latest.status as StatusKey
}

const COLUMNS: StatusKey[] = ['DRAFT', 'PENDING', 'PUBLISHED', 'FAILED']

// ─── Component ───────────────────────────────────────────────────────────────

export default function WorkflowClient({ posts }: WorkflowClientProps) {
    const groups: Record<StatusKey, Post[]> = { DRAFT: [], PENDING: [], PUBLISHED: [], FAILED: [], PROCESSING: [] }
    for (const post of posts) groups[getPostStatus(post)].push(post)
    const totalPosts = posts.length

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">投稿履歴</h1>
                    <p className="text-gray-500 mt-1">
                        {totalPosts > 0 ? `全ステージ合計 ${totalPosts} 件の投稿` : '投稿がありません。最初の投稿を作成してください。'}
                    </p>
                </div>
                <Link href="/create" className="flex items-center gap-2 px-6 py-3 instagram-gradient text-white rounded-xl font-bold shadow-lg shadow-purple-500/20 hover:opacity-90 transition-all duration-200 ease-out active:scale-95 hover:shadow-xl hover:-translate-y-0.5 w-fit">
                    <PlusCircle className="w-4 h-4" />新しい投稿を作成
                </Link>
            </div>

            {/* Summary Pills */}
            <div className="flex flex-wrap gap-3">
                {COLUMNS.map((key) => {
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

            {totalPosts === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-100 p-20 text-center">
                    <div className="w-14 h-14 instagram-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20">
                        <ListChecks className="w-7 h-7 text-white" />
                    </div>
                    <p className="text-base font-bold text-gray-900">投稿履歴が空です</p>
                    <p className="text-sm text-gray-400 mt-1 mb-6">最初の投稿を作成してここでトラッキングしましょう。</p>
                    <Link href="/create" className="inline-flex items-center gap-2 px-6 py-3 instagram-gradient text-white rounded-xl font-bold shadow-lg shadow-purple-500/20 hover:opacity-90 transition-all duration-200 ease-out active:scale-95">
                        <PlusCircle className="w-4 h-4" />投稿を作成
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                    {COLUMNS.map((key) => {
                        const cfg = statusConfig[key]
                        const Icon = cfg.icon
                        const colPosts = groups[key]
                        return (
                            <div key={key} className="space-y-3">
                                <div className={`flex items-center justify-between px-4 py-3 ${cfg.bg} border ${cfg.border} rounded-xl`}>
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                                        <span className={`text-sm font-black uppercase tracking-wider ${cfg.color}`}>{cfg.label}</span>
                                    </div>
                                    <span className={`text-xs font-black ${cfg.color} bg-white/60 px-2 py-0.5 rounded-full`}>{colPosts.length}</span>
                                </div>
                                <div className="space-y-3">
                                    {colPosts.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center gap-2 p-8 bg-white border border-dashed border-gray-100 rounded-2xl text-center">
                                            <Icon className="w-6 h-6 text-gray-200" />
                                            <p className="text-xs font-semibold text-gray-300">{cfg.label}の投稿なし</p>
                                        </div>
                                    ) : colPosts.map((post) => {
                                        const schedule = post.schedules[0]
                                        const isVideo = post.mediaType === 'VIDEO'
                                        return (
                                            <div key={post.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:border-purple-200 hover:shadow-md transition-all">
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
                                                        <img src={post.imageUrl} alt={post.caption || 'Post'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                                    )}
                                                    {post.connectedAccount?.username && (
                                                        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg border border-white/20">
                                                            <Instagram className="w-2.5 h-2.5 text-white" />
                                                            <span className="text-[9px] font-bold text-white">@{post.connectedAccount.username}</span>
                                                        </div>
                                                    )}
                                                    <div className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-black/40 backdrop-blur flex items-center justify-center border border-white/20">
                                                        {isVideo ? <Video className="w-3 h-3 text-white" /> : <ImageIcon className="w-3 h-3 text-white" />}
                                                    </div>
                                                </div>
                                                <div className="p-3 space-y-2">
                                                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                                        {post.caption || <span className="text-gray-300 italic">キャプションなし</span>}
                                                    </p>
                                                    {schedule && (
                                                        <div className="flex items-center gap-1 text-gray-400">
                                                            <Calendar className="w-3 h-3" />
                                                            <span className="text-[10px] font-semibold">{new Date(schedule.scheduledFor).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                    )}
                                                    {!schedule && (
                                                        <div className="flex items-center gap-1 text-gray-400">
                                                            <Clock className="w-3 h-3" />
                                                            <span className="text-[10px] font-semibold">{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                        </div>
                                                    )}
                                                    {key === 'PUBLISHED' && (
                                                        <div className="flex items-center gap-3 mt-2 border-t border-gray-100 pt-2">
                                                            <div className="flex items-center gap-1 text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md">
                                                                <Heart className="w-3 h-3" /><span className="text-[10px] font-bold">{post.likes}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                                                                <Eye className="w-3 h-3" /><span className="text-[10px] font-bold">{post.views}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
