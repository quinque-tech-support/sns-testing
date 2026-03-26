'use client'

import { useState, useMemo } from 'react'
import {
    ChevronLeft,
    ChevronRight,
    Filter,
    Instagram,
    Clock,
    Plus,
    Search,
    X,
    MoreHorizontal,
    Play,
    Image as ImageIcon,
    CheckCircle2,
    Calendar
} from 'lucide-react'
import Link from 'next/link'

interface Schedule {
    id: string
    scheduledFor: string
    status: string
    post: {
        id: string
        caption: string | null
        imageUrl: string
        connectedAccount: {
            username: string | null
        }
    }
}

interface WeekDay {
    name: string
    date: string
    dayOfWeek: number
    fullDate: Date
}

interface CalendarClientProps {
    schedules: Schedule[]
    weekOffset: number
}

function getWeekDays(offsetWeeks: number): WeekDay[] {
    const now = new Date()
    const dayOfWeek = now.getDay() // 0=Sun
    const monday = new Date(now)
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7) + offsetWeeks * 7)

    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    return dayNames.map((name, i) => {
        const d = new Date(monday)
        d.setDate(monday.getDate() + i)
        return {
            name,
            date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            dayOfWeek: i,
            fullDate: d
        }
    })
}

export default function CalendarClient({ schedules, weekOffset: initialOffset }: CalendarClientProps) {
    const [weekOffset, setWeekOffset] = useState(initialOffset)
    const [selectedPost, setSelectedPost] = useState<Schedule | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    const weekDays = useMemo(() => getWeekDays(weekOffset), [weekOffset])

    const weekStart = weekDays[0].fullDate
    const weekEnd = weekDays[6].fullDate
    const weekLabel = `${weekDays[0].date} – ${weekDays[6].date}, ${weekEnd.getFullYear()}`

    // Filter schedules to the current displayed week
    const weekSchedules = useMemo(() => {
        const start = new Date(weekStart)
        start.setHours(0, 0, 0, 0)
        const end = new Date(weekEnd)
        end.setHours(23, 59, 59, 999)

        return schedules.filter(s => {
            const d = new Date(s.scheduledFor)
            return d >= start && d <= end
        })
    }, [schedules, weekStart, weekEnd])

    const getPostsForDay = (day: WeekDay) => {
        return weekSchedules.filter(s => {
            const d = new Date(s.scheduledFor)
            const dayStart = new Date(day.fullDate)
            dayStart.setHours(0, 0, 0, 0)
            const dayEnd = new Date(day.fullDate)
            dayEnd.setHours(23, 59, 59, 999)
            const matchesSearch = !searchQuery ||
                s.post.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.status.toLowerCase().includes(searchQuery.toLowerCase())
            return d >= dayStart && d <= dayEnd && matchesSearch
        })
    }

    const statusColor = (status: string) => {
        switch (status) {
            case 'PUBLISHED': return 'text-green-600'
            case 'PENDING': return 'text-purple-600'
            case 'FAILED': return 'text-red-600'
            default: return 'text-orange-500'
        }
    }

    const statusLabel = (status: string) => {
        switch (status) {
            case 'PUBLISHED': return '公開済み'
            case 'PENDING': return '予約済み'
            case 'PROCESSING': return '処理中'
            case 'FAILED': return '失敗'
            default: return status
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Calendar Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">コンテンツカレンダー</h1>
                    <p className="text-gray-500 mt-1">今週の投稿スケジュールを管理しましょう。</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                    <button
                        onClick={() => setWeekOffset(w => w - 1)}
                        className="p-2 hover:bg-gray-50 rounded-lg transition-all duration-200 ease-out active:scale-95"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-bold px-2 whitespace-nowrap">{weekLabel}</span>
                    <button
                        onClick={() => setWeekOffset(w => w + 1)}
                        className="p-2 hover:bg-gray-50 rounded-lg transition-all duration-200 ease-out active:scale-95"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <Filter className="w-3.5 h-3.5" />
                        今週 {weekSchedules.length} 件の投稿
                    </div>
                </div>
                <div className="relative max-w-xs w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="投稿を検索..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-purple-500 transition-all"
                    />
                </div>
            </div>

            {/* Week Grid */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {weekDays.map((day) => {
                    const posts = getPostsForDay(day)
                    const isToday = day.fullDate.toDateString() === new Date().toDateString()
                    return (
                        <div key={day.name} className={`bg-white rounded-2xl border shadow-sm flex flex-col min-h-[400px] ${isToday ? 'border-purple-200 ring-1 ring-purple-100' : 'border-gray-100'}`}>
                            {/* Day Header */}
                            <div className={`p-4 border-b ${isToday ? 'border-purple-50 bg-purple-50/30' : 'border-gray-50'}`}>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{day.name}</p>
                                <p className={`text-lg font-bold mt-0.5 ${isToday ? 'text-purple-700' : 'text-gray-900'}`}>{day.date}</p>
                                {isToday && (
                                    <div className="mt-2 flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-lg w-fit">
                                        <span className="text-[10px] font-black uppercase tracking-wider">今日</span>
                                    </div>
                                )}
                            </div>

                            {/* Posts */}
                            <div className="p-3 space-y-3 flex-1">
                                {posts.map((schedule) => (
                                    <button
                                        key={schedule.id}
                                        onClick={() => setSelectedPost(schedule)}
                                        className="w-full text-left bg-white rounded-xl border border-gray-100 shadow-sm p-2 hover:border-purple-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ease-out active:scale-[0.98] group overflow-hidden"
                                    >
                                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2 relative">
                                            <img
                                                src={schedule.post.imageUrl}
                                                alt=""
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute top-1.5 right-1.5">
                                                <Instagram className="w-3.5 h-3.5 text-white drop-shadow-md" />
                                            </div>
                                        </div>
                                        <div className="px-1">
                                            <div className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${statusColor(schedule.status)}`}>
                                                {statusLabel(schedule.status)}
                                            </div>
                                            <p className="text-[11px] font-bold text-gray-900 line-clamp-1">
                                                {schedule.post.caption || 'No caption'}
                                            </p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">
                                                {new Date(schedule.scheduledFor).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </button>
                                ))}

                                <Link
                                    href="/create"
                                    className="w-full py-3 border-2 border-dashed border-gray-100 rounded-xl flex items-center justify-center text-gray-300 hover:border-purple-200 hover:text-purple-300 transition-all duration-200 ease-out active:scale-95 mt-auto group"
                                >
                                    <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Side Drawer */}
            {selectedPost && (
                <div
                    className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300 flex justify-end"
                    onClick={() => setSelectedPost(null)}
                >
                    <div
                        className="w-full max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col p-8"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-gray-900">投稿詳細</h2>
                            <button onClick={() => setSelectedPost(null)} className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 ease-out active:scale-95">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-8 no-scrollbar">
                            <div className="aspect-square rounded-3xl bg-gray-100 overflow-hidden shadow-inner border border-gray-100">
                                <img src={selectedPost.post.imageUrl} className="w-full h-full object-cover" alt="" />
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">アカウント</p>
                                        <h3 className="text-lg font-bold text-gray-900 mt-2">
                                            @{selectedPost.post.connectedAccount?.username || 'instagram'}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl">
                                        <Instagram className="w-4 h-4 text-purple-600" />
                                        <span className="text-xs font-bold text-gray-700">Instagram</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ステータス</p>
                                        <p className={`text-sm font-bold mt-1 flex items-center gap-2 ${statusColor(selectedPost.status)}`}>
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            {statusLabel(selectedPost.status)}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">予約日時</p>
                                        <p className="text-sm font-bold text-gray-900 mt-1 flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                                            {new Date(selectedPost.scheduledFor).toLocaleString('en-US', {
                                                month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {selectedPost.post.caption && (
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">キャプション</p>
                                        <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-2xl border border-gray-100 leading-relaxed italic">
                                            "{selectedPost.post.caption}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-8 mt-auto border-t border-gray-100 grid grid-cols-2 gap-4">
                            <Link
                                href="/create"
                                className="py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-600/20 hover:shadow-xl hover:-translate-y-0.5 hover:bg-purple-700 transition-all duration-200 ease-out active:scale-95 text-center text-sm"
                            >
                                投稿を編集
                            </Link>
                            <button
                                onClick={() => setSelectedPost(null)}
                                className="py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all duration-200 ease-out active:scale-95 text-sm"
                            >
                                閉じる
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
