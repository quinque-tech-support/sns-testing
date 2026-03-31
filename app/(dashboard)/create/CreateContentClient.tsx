'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
    Upload,
    Image as ImageIcon,
    Video,
    Calendar,
    Tag,
    Send,
    Smartphone,
    Clock,
    Hash,
    ChevronDown,
    Plus,
    X,
    MessageCircle,
    Heart,
    Bookmark,
    MoreHorizontal,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Instagram,
    Sparkles,
    RefreshCw,
    Activity,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

import { saveDraft, publishNow, schedulePost, getSignedUploadUrl, ActionResult } from './actions'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface ConnectedAccount {
    id: string
    username: string | null
    pageId: string
}

interface CreateContentPageProps {
    accounts: ConnectedAccount[]
}

const tabs = [
    { id: 'publish', label: 'アップロード & 公開', icon: Upload },
    { id: 'schedule', label: '予約投稿', icon: Calendar },
    { id: 'tools', label: 'コンテンツツール', icon: Tag },
]

const leadingSentences = [
    { label: 'お知らせ', text: '🚀 大ニュース！お知らせがあります...' },
    { label: 'ストーリー', text: '✨ 舞台裏：こんな経緯で...' },
    { label: '質問', text: '❓ ひとつ質問：あなたのお気に入りは...' },
    { label: 'ヒント', text: '💡 プロのヒント：こんなことを試したことはありますか...' },
]

const hashtagSets: Record<string, string> = {
    Photography: '#photography #photooftheday #picoftheday #photo #photographer',
    'SaaS/Tech': '#saas #tech #startup #software #innovation #product',
    Lifestyle: '#lifestyle #life #motivation #inspo #explore',
    Business: '#business #entrepreneur #marketing #success #growth',
}

const ctaEndings: Record<string, string> = {
    'プロフィールのリンク': '\n\n👉 詳しくはプロフィールのリンクから！',
    'あとで保存': '\n\n💾 この投稿をあとで保存してね！',
    '友達をタグ付け': '\n\n👇 これを見せたい友達をタグ付けして！',
    'フォロワーへの質問': '\n\n💬 コメント欄で感想を教えてください！',
}

export default function CreateContentClient({ accounts }: CreateContentPageProps) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState('tools')
    const [caption, setCaption] = useState('')
    const [mediaPreview, setMediaPreview] = useState<string | null>(null)
    const [mediaFile, setMediaFile] = useState<File | null>(null)
    const [isVideo, setIsVideo] = useState(false)
    const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '')
    const [scheduledFor, setScheduledFor] = useState('')
    const [hashtags, setHashtags] = useState('')
    const [ctaStyle, setCtaStyle] = useState('Link in Bio')
    const [result, setResult] = useState<ActionResult | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [aiState, setAiState] = useState<'idle' | 'analyzing' | 'ready'>('idle')
    const [aiUsageCount, setAiUsageCount] = useState(0)
    const [aiData, setAiData] = useState<{ caption: string, hashtags: string[], postTime: string, estimatedLikes: string, estimatedReach: string } | null>(null)
    const [aiMode, setAiMode] = useState<'personal' | 'similar' | 'trend'>('personal')
    const [mediaFiles, setMediaFiles] = useState<File[]>([])
    const [isPending, startTransition] = useTransition()
    const [isEdited, setIsEdited] = useState(false)

    const clearResult = () => setResult(null)

    const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setMediaPreview(url)
            setMediaFile(file)
            setMediaFiles([file])
            setIsVideo(file.type.startsWith('video/'))
            if (activeTab === 'tools') {
                setTimeout(() => { generateAI(file, aiMode) }, 100)
            }
        }
    }

    const handleMultiFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length > 0) {
            setMediaFiles(prev => [...prev, ...files])
            if (!mediaFile) {
                setMediaFile(files[0])
                setMediaPreview(URL.createObjectURL(files[0]))
                setIsVideo(files[0].type.startsWith('video/'))
            }
            if (activeTab === 'tools') {
                setTimeout(() => { generateAI(files[0], aiMode) }, 100)
            }
        }
    }

    const uploadMedia = async (): Promise<string | null> => {
        if (!mediaFile) return null
        setIsUploading(true)
        try {
            const fileExt = mediaFile.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`

            // 1. Request a secure upload URL from the server (bypasses RLS)
            const { signedUrl, token, path, error: urlError } = await getSignedUploadUrl(fileName, mediaFile.type)
            if (urlError || !token || !path) {
                throw new Error(urlError || 'Failed to obtain secure upload URL.')
            }

            // 2. Upload directly to Supabase
            const { error: uploadError } = await supabase.storage
                .from('media-uploads')
                .uploadToSignedUrl(path, token, mediaFile, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (uploadError) throw uploadError

            // 3. Return the public URL
            const { data } = supabase.storage
                .from('media-uploads')
                .getPublicUrl(path)

            return data.publicUrl
        } catch (error) {
            console.error('Upload Error:', error)
            setResult({ error: 'Failed to upload media. Please try again.' })
            return null
        } finally {
            setIsUploading(false)
        }
    }

    const buildFormData = (mediaUrl?: string | null) => {
        const fd = new FormData()
        fd.set('caption', caption)
        fd.set('connectedAccountId', selectedAccountId)
        fd.set('isVideo', isVideo.toString())
        if (mediaUrl) fd.set('mediaUrl', mediaUrl)
        return fd
    }

    const handleSaveDraft = async () => {
        if (isUploading || isPending) return
        
        let url = null
        if (mediaFile) {
            url = await uploadMedia()
            if (!url) return // Upload failed, error already set
        }

        startTransition(async () => {
            const fd = buildFormData(url)
            const res = await saveDraft(fd)
            setResult(res)
            if (res.success) {
                setTimeout(() => { router.push('/workflow') }, 1500)
            }
        })
    }

    const generateAI = async (fileToUse?: File | null, mode: string = aiMode) => {
        setAiState('analyzing')
        setResult(null)
        setIsEdited(false)
        try {
            let imageBase64 = null
            let mimeType = null
            
            const targetFile = fileToUse || mediaFiles[0] || mediaFile
            if (targetFile && !targetFile.type.startsWith('video/')) {
                const reader = new FileReader()
                const dataUrl = await new Promise<string>((resolve, reject) => {
                    reader.onload = () => resolve(reader.result as string)
                    reader.onerror = reject
                    reader.readAsDataURL(targetFile)
                })
                imageBase64 = dataUrl
                mimeType = targetFile.type
            }

            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64, mimeType, aiMode: mode })
            })

            const json = await res.json()
            if (!res.ok) throw new Error(json.error || 'AIコンテンツの生成に失敗しました。')
            
            setAiData({
                caption: json.caption || '',
                hashtags: Array.isArray(json.hashtags) ? json.hashtags : [],
                postTime: json.optimalTime || '19:00',
                estimatedLikes: json.expectedLikes || '100〜150',
                estimatedReach: json.expectedReach || '中'
            })
            setAiState('ready')
            setAiUsageCount(prev => prev + 1)
        } catch (error: any) {
            console.error('AI Gen error', error)
            setResult({ error: error.message || 'AI生成に失敗しました。' })
            setAiState('idle')
        }
    }

    const handleGenerateAI = () => generateAI()

    const handleModeChange = (mode: 'personal'|'similar'|'trend') => {
        setAiMode(mode)
        if (mediaFiles.length > 0 || mediaFile || caption) {
            generateAI(mediaFiles[0] || mediaFile, mode)
        }
    }

    const handleCaptionEdit = (value: string) => {
        if (aiData) {
            setAiData({ ...aiData, caption: value })
            setIsEdited(true)
        }
    }

    const handlePublishNow = async () => {
        if (isUploading || isPending) return

        if (!mediaPreview || !mediaFile) {
            setResult({ error: 'Please upload an image or video before publishing.' })
            return
        }

        const url = await uploadMedia()
        if (!url) return

        startTransition(async () => {
            const fd = buildFormData(url)
            const res = await publishNow(fd)
            setResult(res)
            if (res.success) {
                setTimeout(() => { router.push('/dashboard') }, 1500)
            }
        })
    }

    const handleSchedule = async () => {
        if (isUploading || isPending) return

        if (!mediaPreview || !mediaFile) {
            setResult({ error: 'Please upload an image or video before scheduling.' })
            return
        }
        if (!scheduledFor) {
            setResult({ error: 'Please select a date and time to schedule this post.' })
            return
        }

        const url = await uploadMedia()
        if (!url) return

        startTransition(async () => {
            const fd = buildFormData(url)
            fd.set('scheduledFor', new Date(scheduledFor).toISOString())
            const res = await schedulePost(fd)
            setResult(res)
            if (res.success) {
                setTimeout(() => { router.push('/calendar') }, 1500)
            }
        })
    }

    const appendToCaption = (text: string) => {
        setCaption(prev => text + (prev ? '\n\n' + prev : ''))
        clearResult()
    }

    const applyHashtags = () => {
        const tags = hashtagSets[hashtags] || ''
        setCaption(prev => prev + '\n\n' + tags)
    }

    const applyCTA = () => {
        const cta = ctaEndings[ctaStyle] || ''
        setCaption(prev => prev + cta)
    }

    const selectedAccount = accounts.find(a => a.id === selectedAccountId)

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">コンテンツ作成</h1>
                    <p className="text-gray-500 mt-1">Instagram投稿をデザイン・予約・公開しましょう。</p>
                </div>

                {/* Account Selector */}
                {accounts.length > 0 ? (
                    <div className="relative w-full md:w-auto">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            <Instagram className="w-4 h-4 text-purple-500" />
                        </div>
                        <select
                            value={selectedAccountId}
                            onChange={(e) => setSelectedAccountId(e.target.value)}
                            className="appearance-none w-full md:w-64 bg-white border border-gray-200 rounded-xl py-2.5 pl-9 pr-9 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all shadow-sm cursor-pointer"
                        >
                            {accounts.map(a => (
                                <option key={a.id} value={a.id}>
                                    @{a.username || a.pageId}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                ) : (
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-700">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>Instagram アカウントが未連携です。<a href="/account" className="font-bold underline">連携する</a></span>
                    </div>
                )}
            </div>

            {/* Feedback Banner */}
            {result && (
                <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border text-sm font-medium ${result.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    {result.success
                        ? <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                        : <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    }
                    <span>{result.success ? '成功しました！リダイレクトしています...' : result.error}</span>
                    {!result.success && (
                        <button onClick={clearResult} className="ml-auto p-1 hover:bg-red-100 rounded-lg">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )}

            {/* Tab Navigation */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id
                            ? 'bg-white text-purple-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left: Editor Area */}
                <div className="xl:col-span-2 space-y-6">
                    {/* ONLY RENDER MAIN WHITE BOX IF WE ARE NOT IN TOOLS TAB */}
                    {activeTab !== 'tools' && (
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                        {/* Media Upload Section */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">メディアアップロード</label>
                            {mediaPreview ? (
                                <div className="relative aspect-video bg-gray-50 rounded-2xl border border-dashed border-gray-200 overflow-hidden group">
                                    {isVideo ? (
                                        <video src={mediaPreview} controls className="w-full h-full object-contain" />
                                    ) : (
                                        <img src={mediaPreview} alt="Preview" className="w-full h-full object-contain" />
                                    )}
                                    {isVideo && (
                                        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-purple-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider">
                                            <Video className="w-3 h-3" />
                                            Reel
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                        <button
                                            onClick={() => {
                                                setMediaPreview(null)
                                                setMediaFile(null)
                                                setMediaFiles([])
                                                setIsVideo(false)
                                            }}
                                            className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all"
                                        >
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center aspect-video bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all cursor-pointer group">
                                    <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Upload className="w-8 h-8 text-purple-500" />
                                    </div>
                                    <p className="text-gray-900 font-bold">画像または動画をここにドロップ</p>
                                    <p className="text-gray-400 text-sm mt-1">JPG・PNG・MP4・MOV対応（最大500MB）</p>
                                    <input type="file" className="hidden" onChange={handleMediaUpload} accept="image/*,video/*" />
                                </label>
                            )}
                        </div>

                        {/* Caption Editor */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">キャプション</label>
                                <span className="text-xs text-gray-400">{caption.length} / 2200</span>
                            </div>
                            <textarea
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder="キャプションを入力してください..."
                                className="w-full min-h-[160px] p-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all resize-none"
                                maxLength={2200}
                            />
                        </div>

                        {/* --- PUBLISH TAB ACTIONS --- */}
                        {activeTab === 'publish' && (
                            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                                <button
                                    onClick={handlePublishNow}
                                    disabled={isPending || accounts.length === 0}
                                    className="flex items-center gap-2 px-6 py-3 instagram-gradient text-white rounded-xl font-bold shadow-lg shadow-purple-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    今すぐ公開
                                </button>
                                <button
                                    onClick={handleSaveDraft}
                                    disabled={isPending || accounts.length === 0}
                                    className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
                                >
                                    {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                    下書き保存
                                </button>
                            </div>
                        )}

                        {/* --- SCHEDULE TAB ACTIONS --- */}
                        {activeTab === 'schedule' && (
                            <div className="space-y-6 pt-4 border-t border-gray-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">公開日時</label>
                                        <div className="flex items-center relative group">
                                            <Calendar className="absolute left-4 w-4 h-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                                            <input
                                                type="datetime-local"
                                                value={scheduledFor}
                                                onChange={(e) => setScheduledFor(e.target.value)}
                                                min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000 + 60000).toISOString().slice(0, 16)}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">推定リーチ</label>
                                        <div className="px-4 py-2.5 bg-purple-50 border border-purple-100 rounded-xl">
                                            <p className="text-sm font-bold text-purple-700">📈 最適な投稿時間帯:</p>
                                            <p className="text-xs text-purple-600 mt-1">火〜金：9〜11時、13〜15時、19〜21時</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={handleSchedule}
                                        disabled={isPending || !scheduledFor || accounts.length === 0}
                                        className="flex items-center gap-2 px-8 py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-600/20 hover:bg-purple-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                                        投稿を予約する
                                    </button>
                                    <button
                                        onClick={handleSaveDraft}
                                        disabled={isPending || accounts.length === 0}
                                        className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
                                    >
                                        下書き保存
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    )} {/* <-- This closes activeTab !== 'tools' */}

                    {/* --- NEW CONTENT TOOLS LAYOUT (2-COLUMN) --- */}
                    {activeTab === 'tools' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                            
                            {/* LEFT SIDE: MULTI IMAGE UPLOAD */}
                            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col h-full min-h-[500px]">
                                <h2 className="text-sm font-bold text-zinc-900 mb-6">メディアアップロード</h2>
                                {mediaFiles.length > 0 ? (
                                    <div className="flex-1 flex flex-col">
                                        <div className="flex overflow-x-auto gap-3 pb-4 snap-x">
                                            {mediaFiles.map((file, i) => (
                                                <div key={i} className="relative shrink-0 snap-start">
                                                    <img src={URL.createObjectURL(file)} className="w-[140px] h-[140px] rounded-xl object-cover border border-zinc-200 shadow-sm" />
                                                    <button onClick={() => {
                                                        const newArray = mediaFiles.filter((_, idx) => idx !== i);
                                                        setMediaFiles(newArray);
                                                        if (newArray.length === 0) {
                                                            setMediaFile(null);
                                                            setMediaPreview(null);
                                                            setIsVideo(false);
                                                        } else if (i === 0) {
                                                            setMediaFile(newArray[0]);
                                                            setMediaPreview(URL.createObjectURL(newArray[0]));
                                                            setIsVideo(newArray[0].type.startsWith('video/'));
                                                        }
                                                    }} className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white backdrop-blur z-10">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                            <label className="shrink-0 w-[140px] h-[140px] rounded-xl border border-dashed border-zinc-300 hover:border-zinc-400 bg-zinc-50 hover:bg-zinc-100 flex items-center justify-center cursor-pointer transition-colors">
                                                <Plus className="w-8 h-8 text-zinc-400" />
                                                <input type="file" multiple className="hidden" onChange={handleMultiFileUpload} accept="image/*,video/*" />
                                            </label>
                                        </div>
                                        <div className="mt-auto pt-6 border-t border-zinc-100 flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-zinc-400" />
                                            <p className="text-xs font-bold text-zinc-500">カルーセル投稿として公開されます</p>
                                        </div>
                                    </div>
                                ) : (
                                    <label className="flex-1 flex flex-col items-center justify-center bg-zinc-50 rounded-xl border border-dashed border-zinc-300 hover:border-zinc-400 hover:bg-zinc-100 transition-all cursor-pointer group">
                                        <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-zinc-100 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                                            <Upload className="w-5 h-5 text-zinc-500" />
                                        </div>
                                        <p className="text-zinc-800 text-sm font-bold">画像をドラッグ＆ドロップ</p>
                                        <p className="text-zinc-400 text-xs mt-1">またはクリックでファイルを選択</p>
                                        <input type="file" multiple className="hidden" onChange={handleMultiFileUpload} accept="image/*,video/*" />
                                    </label>
                                )}
                            </div>

                            {/* RIGHT SIDE: AI PROPOSALS */}
                            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm flex flex-col h-full min-h-[500px]">
                                <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50 rounded-t-2xl">
                                    <div className="flex flex-col">
                                        <h2 className="text-sm font-bold text-zinc-900">AI提案</h2>
                                        <p className="text-[10px] text-zinc-500 font-medium mt-0.5">ワンクリックで最適な構成を提案します</p>
                                    </div>
                                    <button onClick={handleGenerateAI} disabled={aiState === 'analyzing' || mediaFiles.length === 0} className={cn("px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm border transition-all flex items-center gap-2", aiState === 'analyzing' || mediaFiles.length === 0 ? "bg-white border-zinc-200 text-zinc-400 cursor-not-allowed" : "bg-white border-zinc-200 text-zinc-800 hover:bg-zinc-50 active:scale-95")}>
                                        <RefreshCw className={cn("w-3 h-3 text-zinc-600", aiState === 'analyzing' && "animate-spin")} />
                                        再生成
                                    </button>
                                </div>
                                <div className="p-5 flex-1 flex flex-col relative">
                                    
                                    {/* Mode Selector */}
                                    <div className="grid grid-cols-3 gap-2 mb-6">
                                        {[
                                            { id: 'personal', label: '自分の投稿', detail: '過去データを参考に提案' },
                                            { id: 'similar', label: '類似投稿', detail: '同ジャンルを参考に提案' },
                                            { id: 'trend', label: 'トレンド', detail: '現在の人気スタイル' }
                                        ].map(m => (
                                            <button 
                                                key={m.id} 
                                                onClick={() => handleModeChange(m.id as any)} 
                                                className={cn("flex flex-col items-start p-2.5 rounded-xl border transition-all text-left shadow-sm active:scale-95", aiMode === m.id ? "bg-zinc-900 border-zinc-900 text-white" : "border-zinc-200 bg-white hover:bg-zinc-50")}
                                            >
                                                <span className={cn("text-[11px] font-bold block", aiMode === m.id ? "text-white" : "text-zinc-800")}>{m.label}</span>
                                                <span className={cn("text-[8px] sm:text-[9px] mt-1 line-clamp-2 leading-tight", aiMode === m.id ? "text-zinc-300" : "text-zinc-500")}>{m.detail}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {aiState === 'analyzing' && (
                                        <div className="absolute inset-x-0 bottom-0 top-[120px] bg-white/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-b-2xl">
                                            <Loader2 className="w-8 h-8 text-zinc-900 animate-spin mb-4" />
                                            <p className="text-sm font-bold text-zinc-800">分析中…</p>
                                        </div>
                                    )}

                                    {/* AI Content Area */}
                                    {aiData ? (
                                        <div className="space-y-6 flex-1 flex flex-col">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <label className="text-xs font-bold text-zinc-500">キャプション</label>
                                                    {!isEdited && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded flex items-center gap-0.5"><Sparkles className="w-2.5 h-2.5" />AI</span>}
                                                </div>
                                                <textarea 
                                                    value={aiData.caption}
                                                    onChange={(e) => handleCaptionEdit(e.target.value)}
                                                    className="w-full min-h-[140px] text-sm text-zinc-800 bg-white border border-zinc-300 p-3.5 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all resize-y"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-zinc-500">ハッシュタグ</label>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {aiData.hashtags.map((tag, i) => (
                                                        <span key={i} className="px-2 py-1 bg-zinc-100 text-zinc-700 text-[10px] font-bold rounded-md border border-zinc-200">{tag}</span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* AI Insights Read Only */}
                                            <div className="bg-zinc-50 border border-zinc-200 shadow-sm rounded-xl p-4 mt-auto">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-6 h-6 rounded-md bg-zinc-200 flex items-center justify-center">
                                                        <Activity className="w-3.5 h-3.5 text-zinc-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xs font-bold text-zinc-900">AIインサイト</h3>
                                                        <p className="text-[9px] text-zinc-500">類似データと傾向に基づく予測</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white p-3 rounded-lg border border-zinc-100">
                                                    <div>
                                                        <span className="block text-zinc-500 mb-1 text-[10px] font-medium flex items-center gap-1"><Clock className="w-3 h-3" />最適な投稿時間</span>
                                                        <span className="font-bold text-zinc-900">{aiData.postTime}</span>
                                                    </div>
                                                    <div>
                                                        <span className="block text-zinc-500 mb-1 text-[10px] font-medium flex items-center gap-1"><Heart className="w-3 h-3" />予想いいね数</span>
                                                        <span className="font-bold text-zinc-900">{aiData.estimatedLikes}</span>
                                                    </div>
                                                    <div>
                                                        <span className="block text-zinc-500 mb-1 text-[10px] font-medium flex items-center gap-1"><Activity className="w-3 h-3" />予想到達度</span>
                                                        <span className="font-bold text-zinc-900">{aiData.estimatedReach}</span>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center text-zinc-400">
                                            <div className="w-16 h-16 bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-full flex items-center justify-center mb-4">
                                                <Sparkles className="w-6 h-6 text-zinc-300" />
                                            </div>
                                            <p className="text-sm font-bold text-zinc-500">AI提案の準備ができています</p>
                                            <p className="text-xs mt-1 max-w-[200px] text-center">メディアをアップロードして、AIによる最適な提案を生成しましょう。</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* BOTTOM SHARED ACTIONS FOR TOOLS TAB */}
                    {activeTab === 'tools' && (
                        <div className="pt-6 border-t border-zinc-100 flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => {
                                    if(aiData) setCaption(aiData.caption + '\n\n' + aiData.hashtags.join(' '));
                                    handlePublishNow();
                                }}
                                disabled={isPending || accounts.length === 0 || mediaFiles.length === 0}
                                className="flex-1 py-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-sm font-bold shadow-md active:scale-[0.98] transition-all text-center disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Send className="w-4 h-4" />今すぐ投稿
                            </button>
                            <button
                                onClick={() => {
                                    if(aiData) setCaption(aiData.caption + '\n\n' + aiData.hashtags.join(' '));
                                    setActiveTab('schedule');
                                }}
                                disabled={isPending || accounts.length === 0 || mediaFiles.length === 0}
                                className="flex-1 py-4 bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50 rounded-xl text-sm font-bold shadow-sm active:scale-[0.98] transition-all text-center disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Calendar className="w-4 h-4" />予約投稿に進む
                            </button>
                        </div>
                    )}
                </div>

                {/* Right: Mobile Mockup Preview */}
                <div className="flex flex-col items-center">
                    <div className="sticky top-24 w-full max-w-[320px] aspect-[9/18.5] bg-gray-900 rounded-[40px] border-[6px] border-gray-800 p-2 shadow-2xl relative overflow-hidden">
                        {/* Speaker/Camera Mockup */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-800 rounded-b-2xl z-20 flex items-center justify-center">
                            <div className="w-8 h-1 bg-gray-700 rounded-full" />
                        </div>

                        <div className="w-full h-full bg-white rounded-[32px] overflow-hidden flex flex-col relative">
                            {/* Instagram Header */}
                            <div className="h-10 px-4 flex items-center justify-between border-b border-gray-100 mt-2 shrink-0">
                                <span className="font-bold text-sm tracking-tight instagram-text-gradient">Postara</span>
                                <div className="flex gap-3">
                                    <Plus className="w-5 h-5" />
                                    <Heart className="w-5 h-5" />
                                    <MessageCircle className="w-5 h-5 text-gray-900" />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto no-scrollbar">
                                <div className="p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full instagram-gradient p-0.5">
                                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                                <div className="w-full h-full bg-purple-500" />
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold">{selectedAccount?.username ? `@${selectedAccount.username}` : 'your_account'}</span>
                                    </div>
                                    <MoreHorizontal className="w-4 h-4" />
                                </div>

                                <div className="aspect-square bg-gray-100 flex items-center justify-center relative overflow-hidden">
                                    {mediaPreview ? (
                                        isVideo ? (
                                            <div className="w-full h-full bg-gray-900 flex items-center justify-center relative">
                                                <video src={mediaPreview} className="w-full h-full object-cover opacity-80" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur flex items-center justify-center">
                                                        <Video className="w-5 h-5 text-white" />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <img src={mediaPreview} className="w-full h-full object-cover" alt="Preview" />
                                        )
                                    ) : (
                                        <ImageIcon className="w-12 h-12 text-gray-300" />
                                    )}
                                </div>

                                <div className="p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex gap-3">
                                            <Heart className="w-5 h-5" />
                                            <MessageCircle className="w-5 h-5" />
                                            <Send className="w-5 h-5" />
                                        </div>
                                        <Bookmark className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold">1,248 likes</p>
                                        <p className="text-xs leading-relaxed">
                                            <span className="font-bold mr-1">{selectedAccount?.username || 'brand_official'}</span>
                                            <span className="text-gray-600 whitespace-pre-wrap">
                                                {caption || 'Your caption will appear here...'}
                                            </span>
                                        </p>
                                        {scheduledFor && activeTab === 'schedule' && (
                                            <p className="text-[10px] text-purple-500 font-semibold flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                Scheduled for {new Date(scheduledFor).toLocaleString()}
                                            </p>
                                        )}
                                        {!scheduledFor && <p className="text-[10px] text-gray-400 uppercase mt-2">Just now</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-sm font-medium text-gray-400 mt-4 flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        モバイルプレビュー
                    </p>
                </div>
            </div>
        </div>
    )
}
