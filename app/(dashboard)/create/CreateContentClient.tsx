'use client'

import { useState, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
    Upload,
    Image as ImageIcon,
    Video,
    Calendar,
    Tag,
    Send,
    Clock,
    Hash,
    ChevronDown,
    Plus,
    X,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Instagram,
    Sparkles,
    RefreshCw,
    Activity,
    Images,
    ArrowRight,
    FileImage,
    Zap,
} from 'lucide-react'
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
    { id: 'tools', label: 'AI コンテンツツール', icon: Sparkles },
    { id: 'publish', label: 'アップロード & 公開', icon: Upload },
    { id: 'schedule', label: '予約投稿', icon: Calendar },
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

// ─────────────────────────────────────────────
// Step indicator
// ─────────────────────────────────────────────
function StepIndicator({ step, hasMedia, hasAI }: { step: number; hasMedia: boolean; hasAI: boolean }) {
    const steps = [
        { num: 1, label: 'メディアをアップロード', done: hasMedia },
        { num: 2, label: 'AIが提案を生成', done: hasAI },
        { num: 3, label: '投稿または予約', done: false },
    ]
    return (
        <div className="flex items-center gap-2">
            {steps.map((s, i) => (
                <div key={s.num} className="flex items-center gap-2">
                    <div className={cn(
                        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
                        s.done
                            ? 'bg-violet-600 text-white'
                            : step === s.num
                                ? 'bg-violet-50 text-violet-700 border border-violet-200'
                                : 'bg-gray-100 text-gray-400'
                    )}>
                        {s.done ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                            <span className={cn(
                                'w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold border',
                                step === s.num ? 'border-violet-400 text-violet-600' : 'border-gray-300 text-gray-400'
                            )}>{s.num}</span>
                        )}
                        <span className="hidden sm:inline">{s.label}</span>
                    </div>
                    {i < steps.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                    )}
                </div>
            ))}
        </div>
    )
}

// ─────────────────────────────────────────────
// Section header
// ─────────────────────────────────────────────
function SectionLabel({ step, label, description }: { step?: number; label: string; description?: string }) {
    return (
        <div className="flex items-start gap-3 mb-4">
            {step && (
                <div className="w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {step}
                </div>
            )}
            <div>
                <p className="text-sm font-bold text-gray-900">{label}</p>
                {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────
// Multi-image upload strip (shared between tabs)
// ─────────────────────────────────────────────
function MediaUploadStrip({
    mediaFiles,
    setMediaFiles,
    setMediaFile,
    setMediaPreview,
    setIsVideo,
    isVideo,
    onNewFile,
}: {
    mediaFiles: File[]
    setMediaFiles: React.Dispatch<React.SetStateAction<File[]>>
    setMediaFile: React.Dispatch<React.SetStateAction<File | null>>
    setMediaPreview: React.Dispatch<React.SetStateAction<string | null>>
    setIsVideo: React.Dispatch<React.SetStateAction<boolean>>
    isVideo: boolean
    onNewFile?: (f: File) => void
}) {
    const handleFiles = (incoming: File[]) => {
        if (incoming.length === 0) return
        const first = incoming[0]
        const firstIsVideo = first.type.startsWith('video/')

        if (firstIsVideo) {
            setMediaFiles([first])
            setMediaFile(first)
            setMediaPreview(URL.createObjectURL(first))
            setIsVideo(true)
            onNewFile?.(first)
        } else {
            setMediaFiles(prev => {
                const filtered = prev.filter(f => !f.type.startsWith('video/'))
                return [...filtered, ...incoming.filter(f => !f.type.startsWith('video/'))]
            })
            setMediaFile(first)
            setMediaPreview(URL.createObjectURL(first))
            setIsVideo(false)
            onNewFile?.(first)
        }
    }

    const removeFile = (idx: number) => {
        setMediaFiles(prev => {
            const next = prev.filter((_, i) => i !== idx)
            if (next.length === 0) {
                setMediaFile(null)
                setMediaPreview(null)
                setIsVideo(false)
            } else {
                setMediaFile(next[0])
                setMediaPreview(URL.createObjectURL(next[0]))
                setIsVideo(next[0].type.startsWith('video/'))
            }
            return next
        })
    }

    if (mediaFiles.length === 0) {
        return (
            <label className="group flex flex-col items-center justify-center min-h-[220px] bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 hover:border-violet-400 hover:bg-violet-50/40 transition-all duration-200 cursor-pointer">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-md border border-gray-100 flex items-center justify-center mb-4 group-hover:scale-105 group-hover:shadow-violet-200/60 group-hover:border-violet-200 transition-all duration-200">
                    <FileImage className="w-7 h-7 text-violet-500" />
                </div>
                <p className="text-gray-900 font-semibold text-sm">クリックまたはドラッグ＆ドロップ</p>
                <p className="text-gray-400 text-xs mt-1.5">画像（複数可）または動画・リール（1本）</p>
                <div className="mt-4 px-4 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-600 group-hover:border-violet-300 group-hover:text-violet-600 transition-all">
                    ファイルを選択
                </div>
                <input
                    type="file"
                    multiple
                    className="hidden"
                    accept="image/*,video/*"
                    onChange={e => handleFiles(Array.from(e.target.files || []))}
                />
            </label>
        )
    }

    return (
        <div className="space-y-3">
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                {mediaFiles.map((file, i) => (
                    <div key={i} className="relative shrink-0 snap-start">
                        {file.type.startsWith('video/') ? (
                            <div className="w-[130px] h-[130px] rounded-xl bg-gray-900 flex items-center justify-center border border-gray-200 shadow-sm">
                                <Video className="w-8 h-8 text-white/60" />
                                <span className="absolute bottom-1 left-1 text-[9px] bg-violet-600 text-white px-1.5 py-0.5 rounded font-bold">REEL</span>
                            </div>
                        ) : (
                            <img
                                src={URL.createObjectURL(file)}
                                className="w-[130px] h-[130px] rounded-xl object-cover border border-gray-200 shadow-sm"
                                alt={`media-${i}`}
                            />
                        )}
                        <button
                            onClick={() => removeFile(i)}
                            className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white backdrop-blur z-10 transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>
                        {i === 0 && mediaFiles.length > 1 && (
                            <span className="absolute bottom-1.5 left-1.5 text-[9px] bg-black/50 text-white px-1.5 py-0.5 rounded font-bold">表紙</span>
                        )}
                    </div>
                ))}

                {!isVideo && (
                    <label className="shrink-0 w-[130px] h-[130px] rounded-xl border-2 border-dashed border-gray-200 hover:border-violet-400 bg-gray-50 hover:bg-violet-50/40 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 gap-1.5">
                        <Plus className="w-6 h-6 text-gray-400" />
                        <span className="text-[10px] text-gray-500 font-semibold">追加</span>
                        <input
                            type="file"
                            multiple
                            className="hidden"
                            accept="image/*"
                            onChange={e => handleFiles(Array.from(e.target.files || []))}
                        />
                    </label>
                )}
            </div>

            {mediaFiles.length > 1 && (
                <div className="flex items-center gap-1.5 px-3 py-2 bg-violet-50 border border-violet-100 rounded-lg text-xs text-violet-700">
                    <Images className="w-3.5 h-3.5" />
                    <span className="font-semibold">{mediaFiles.length}枚のカルーセル投稿として公開されます</span>
                </div>
            )}
        </div>
    )
}

// ─────────────────────────────────────────────
// Caption field (shared)
// ─────────────────────────────────────────────
function CaptionField({
    value,
    onChange,
    placeholder = 'キャプションを入力してください...',
}: {
    value: string
    onChange: (v: string) => void
    placeholder?: string
}) {
    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-gray-900">キャプション</label>
                <span className={cn('text-xs font-medium tabular-nums', value.length > 2000 ? 'text-red-500' : 'text-gray-400')}>
                    {value.length} / 2200
                </span>
            </div>
            <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full min-h-[160px] p-4 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm leading-relaxed placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all resize-none"
                maxLength={2200}
            />
        </div>
    )
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
export default function CreateContentClient({ accounts }: CreateContentPageProps) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState('tools')

    const [mediaPreview, setMediaPreview] = useState<string | null>(null)
    const [mediaFile, setMediaFile] = useState<File | null>(null)
    const [mediaFiles, setMediaFiles] = useState<File[]>([])
    const [isVideo, setIsVideo] = useState(false)

    const [caption, setCaption] = useState('')

    const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '')
    const [scheduledFor, setScheduledFor] = useState('')
    const [hashtags, setHashtags] = useState('')
    const [ctaStyle, setCtaStyle] = useState('プロフィールのリンク')
    const [result, setResult] = useState<ActionResult | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [isPending, startTransition] = useTransition()

    const [aiState, setAiState] = useState<'idle' | 'analyzing' | 'ready'>('idle')
    const [aiUsageCount, setAiUsageCount] = useState(0)
    const [aiData, setAiData] = useState<{
        caption: string
        hashtags: string[]
        postTime: string
        estimatedLikes: string
        estimatedReach: string
    } | null>(null)
    const [aiMode, setAiMode] = useState<'personal' | 'similar' | 'trend'>('personal')
    const [isEdited, setIsEdited] = useState(false)

    const clearResult = () => setResult(null)

    // Upload a single file and return its public URL
    const uploadSingleFile = async (file: File): Promise<string | null> => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
        const { token, path, error: urlError } = await getSignedUploadUrl(fileName, file.type)
        if (urlError || !token || !path) throw new Error(urlError || 'Failed to obtain secure upload URL.')

        const { error: uploadError } = await supabase.storage
            .from('media-uploads')
            .uploadToSignedUrl(path, token, file, { cacheControl: '3600', upsert: false })

        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('media-uploads').getPublicUrl(path)
        return data.publicUrl
    }

    // Upload ALL selected files and return their public URLs (preserves order)
    const uploadAllMedia = async (): Promise<string[] | null> => {
        if (mediaFiles.length === 0) return null
        setIsUploading(true)
        try {
            const urls = await Promise.all(mediaFiles.map(f => uploadSingleFile(f)))
            if (urls.some(u => u === null)) throw new Error('One or more files failed to upload.')
            return urls as string[]
        } catch (error) {
            console.error('Upload Error:', error)
            setResult({ error: 'メディアのアップロードに失敗しました。もう一度お試しください。' })
            return null
        } finally {
            setIsUploading(false)
        }
    }

    const flushAiToCaption = useCallback(() => {
        if (aiData) {
            const merged = (aiData.caption + '\n\n' + aiData.hashtags.join(' ')).trim()
            setCaption(merged)
            return merged
        }
        return caption
    }, [aiData, caption])

    const buildFormData = (mediaUrls: string[], captionOverride?: string) => {
        const fd = new FormData()
        fd.set('caption', captionOverride ?? caption)
        fd.set('connectedAccountId', selectedAccountId)
        fd.set('isVideo', isVideo.toString())
        // Send all URLs — server reads getAll('mediaUrls[]')
        mediaUrls.forEach(url => fd.append('mediaUrls[]', url))
        // Keep legacy field for saveDraft (uses only first)
        if (mediaUrls.length > 0) fd.set('mediaUrl', mediaUrls[0])
        return fd
    }

    const handleSaveDraft = async () => {
        if (isUploading || isPending) return
        let urls: string[] = []
        if (mediaFiles.length > 0) {
            const result = await uploadAllMedia()
            if (!result) return
            urls = result
        }
        startTransition(async () => {
            const fd = buildFormData(urls)
            const res = await saveDraft(fd)
            setResult(res)
            if (res.success) setTimeout(() => router.push('/workflow'), 1500)
        })
    }

    const handlePublishNow = async (captionToUse?: string) => {
        if (isUploading || isPending) return
        if (mediaFiles.length === 0) {
            setResult({ error: '画像または動画をアップロードしてください。' })
            return
        }
        const urls = await uploadAllMedia()
        if (!urls) return
        startTransition(async () => {
            const fd = buildFormData(urls, captionToUse)
            const res = await publishNow(fd)
            setResult(res)
            if (res.success) setTimeout(() => router.push('/dashboard'), 1500)
        })
    }

    const handleSchedule = async (captionToUse?: string) => {
        if (isUploading || isPending) return
        if (mediaFiles.length === 0) {
            setResult({ error: '画像または動画をアップロードしてください。' })
            return
        }
        if (!scheduledFor) {
            setResult({ error: '公開日時を選択してください。' })
            return
        }
        const urls = await uploadAllMedia()
        if (!urls) return
        startTransition(async () => {
            const fd = buildFormData(urls, captionToUse)
            fd.set('scheduledFor', new Date(scheduledFor).toISOString())
            const res = await schedulePost(fd)
            setResult(res)
            if (res.success) setTimeout(() => router.push('/calendar'), 1500)
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
                body: JSON.stringify({ imageBase64, mimeType, aiMode: mode }),
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error || 'AIコンテンツの生成に失敗しました。')
            setAiData({
                caption: json.caption || '',
                hashtags: Array.isArray(json.hashtags) ? json.hashtags : [],
                postTime: json.optimalTime || '19:00',
                estimatedLikes: json.expectedLikes || '100〜150',
                estimatedReach: json.expectedReach || '中',
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

    const handleModeChange = (mode: 'personal' | 'similar' | 'trend') => {
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
    const isWorking = isPending || isUploading

    // Compute which step user is on for the tools tab
    const currentStep = mediaFiles.length === 0 ? 1 : aiState !== 'ready' ? 2 : 3

    // ─────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl">

            {/* ── Page Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">コンテンツ作成</h1>
                    <p className="text-sm text-gray-500 mt-0.5">投稿を作成・AIで最適化・公開または予約しましょう</p>
                </div>

                {/* Account selector */}
                {accounts.length > 0 ? (
                    <div className="relative w-full md:w-auto">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <Instagram className="w-4 h-4 text-violet-500" />
                        </div>
                        <select
                            value={selectedAccountId}
                            onChange={e => setSelectedAccountId(e.target.value)}
                            className="appearance-none w-full md:w-60 bg-white border border-gray-200 rounded-xl py-2.5 pl-9 pr-9 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all shadow-sm cursor-pointer hover:border-gray-300"
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
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>Instagram アカウントが未連携です。<a href="/account" className="font-bold underline">連携する</a></span>
                    </div>
                )}
            </div>

            {/* ── Feedback Banner ── */}
            {result && (
                <div className={cn(
                    'flex items-center gap-3 px-4 py-3.5 rounded-xl border text-sm font-medium',
                    result.success
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                )}>
                    {result.success
                        ? <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                        : <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    }
                    <span>{result.success ? '成功しました！リダイレクトしています...' : result.error}</span>
                    {!result.success && (
                        <button onClick={clearResult} className="ml-auto p-1 hover:bg-red-100 rounded-lg transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )}

            {/* ── Tabs ── */}
            <div className="flex items-center gap-0 border-b border-gray-200">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            'flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-all',
                            activeTab === tab.id
                                ? 'border-violet-600 text-violet-700'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        )}
                    >
                        <tab.icon className={cn('w-4 h-4', activeTab === tab.id ? 'text-violet-600' : 'text-gray-400')} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ════════════════════════════════════════
                TOOLS TAB — AI-first workflow
            ════════════════════════════════════════ */}
            {activeTab === 'tools' && (
                <div className="space-y-6">
                    {/* Step progress */}
                    <StepIndicator
                        step={currentStep}
                        hasMedia={mediaFiles.length > 0}
                        hasAI={aiState === 'ready'}
                    />

                    {/* Two-column editor */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                        {/* LEFT — Upload */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60 flex items-center gap-2.5">
                                <div className="w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold shrink-0">1</div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">メディアをアップロード</p>
                                    <p className="text-xs text-gray-500">画像または動画を選択してください</p>
                                </div>
                            </div>
                            <div className="p-5">
                                <MediaUploadStrip
                                    mediaFiles={mediaFiles}
                                    setMediaFiles={setMediaFiles}
                                    setMediaFile={setMediaFile}
                                    setMediaPreview={setMediaPreview}
                                    setIsVideo={setIsVideo}
                                    isVideo={isVideo}
                                    onNewFile={f => setTimeout(() => generateAI(f, aiMode), 100)}
                                />
                            </div>
                        </div>

                        {/* RIGHT — AI Suggestions */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className={cn(
                                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all',
                                        aiState === 'ready' ? 'bg-violet-600 text-white' : 'bg-gray-200 text-gray-500'
                                    )}>
                                        {aiState === 'ready' ? <CheckCircle2 className="w-3.5 h-3.5" /> : '2'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                                            AI キャプション提案
                                            {aiState === 'ready' && !isEdited && (
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-violet-100 text-violet-700 rounded-full flex items-center gap-0.5">
                                                    <Sparkles className="w-2.5 h-2.5" /> AI生成済み
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-500">画像をアップして自動で最適化</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleGenerateAI}
                                    disabled={aiState === 'analyzing' || mediaFiles.length === 0}
                                    className={cn(
                                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                                        aiState === 'analyzing' || mediaFiles.length === 0
                                            ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                                            : 'bg-white border-gray-200 text-gray-700 hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50 active:scale-95'
                                    )}
                                >
                                    <RefreshCw className={cn('w-3.5 h-3.5', aiState === 'analyzing' && 'animate-spin')} />
                                    再生成
                                </button>
                            </div>

                            <div className="p-5 flex-1 flex flex-col relative min-h-[380px]">
                                {/* AI Mode pills */}
                                <div className="flex items-center gap-2 mb-5 flex-wrap">
                                    {[
                                        { id: 'personal', label: '自分の投稿スタイル' },
                                        { id: 'similar', label: '類似コンテンツ' },
                                        { id: 'trend', label: 'トレンド' },
                                    ].map(m => (
                                        <button
                                            key={m.id}
                                            onClick={() => handleModeChange(m.id as any)}
                                            className={cn(
                                                'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                                                aiMode === m.id
                                                    ? 'bg-violet-600 border-violet-600 text-white shadow-sm'
                                                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                            )}
                                        >
                                            {m.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Analyzing overlay */}
                                {aiState === 'analyzing' && (
                                    <div className="absolute inset-x-0 bottom-0 top-[90px] bg-white/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-b-2xl">
                                        <div className="w-12 h-12 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center mb-3">
                                            <Loader2 className="w-6 h-6 text-violet-600 animate-spin" />
                                        </div>
                                        <p className="text-sm font-bold text-gray-800">AIが分析中…</p>
                                        <p className="text-xs text-gray-500 mt-1">最適なキャプションを生成しています</p>
                                    </div>
                                )}

                                {/* Empty state */}
                                {aiState === 'idle' && !aiData && (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                                        <div className="w-16 h-16 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center mb-4">
                                            <Sparkles className="w-7 h-7 text-gray-300" />
                                        </div>
                                        <p className="text-sm font-bold text-gray-700">AI提案の準備ができています</p>
                                        <p className="text-xs text-gray-400 mt-1.5 max-w-[220px] leading-relaxed">
                                            ← まず左側から画像をアップロードしてください。自動でキャプションが生成されます。
                                        </p>
                                    </div>
                                )}

                                {/* AI Results */}
                                {aiData && (
                                    <div className="space-y-4 flex-1 flex flex-col">
                                        {/* Caption editor */}
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-bold text-gray-700">キャプション</label>
                                                {!isEdited ? (
                                                    <span className="text-[10px] text-violet-600 font-semibold flex items-center gap-0.5">
                                                        <Sparkles className="w-2.5 h-2.5" /> AI生成
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-gray-400 font-medium">編集済み</span>
                                                )}
                                            </div>
                                            <textarea
                                                value={aiData.caption}
                                                onChange={e => handleCaptionEdit(e.target.value)}
                                                className="w-full min-h-[110px] text-sm text-gray-800 bg-gray-50 border border-gray-200 p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all resize-y leading-relaxed"
                                            />
                                        </div>

                                        {/* Hashtags */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-700">ハッシュタグ</label>
                                            <div className="flex flex-wrap gap-1.5">
                                                {aiData.hashtags.map((tag, i) => (
                                                    <span key={i} className="px-2.5 py-1 bg-violet-50 text-violet-700 text-xs font-semibold rounded-full border border-violet-100">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Insights card */}
                                        <div className="mt-auto bg-gradient-to-br from-gray-50 to-gray-50/50 border border-gray-200 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-5 h-5 rounded-md bg-violet-100 flex items-center justify-center">
                                                    <Activity className="w-3 h-3 text-violet-600" />
                                                </div>
                                                <p className="text-xs font-bold text-gray-800">AIインサイト</p>
                                                <p className="text-[10px] text-gray-500">類似データに基づく予測</p>
                                            </div>
                                            <div className="grid grid-cols-3 gap-3">
                                                {[
                                                    { emoji: '⏰', label: '最適時間', value: aiData.postTime },
                                                    { emoji: '❤️', label: 'いいね予測', value: aiData.estimatedLikes },
                                                    { emoji: '📈', label: 'リーチ', value: aiData.estimatedReach },
                                                ].map(item => (
                                                    <div key={item.label} className="bg-white rounded-lg p-2.5 border border-gray-100 text-center">
                                                        <p className="text-base mb-0.5">{item.emoji}</p>
                                                        <p className="text-[10px] text-gray-500 font-medium">{item.label}</p>
                                                        <p className="text-xs font-bold text-gray-900 mt-0.5">{item.value}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Step 3: Action Bar ── */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className={cn(
                                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                                mediaFiles.length > 0 && aiState === 'ready'
                                    ? 'bg-violet-600 text-white'
                                    : 'bg-gray-200 text-gray-500'
                            )}>3</div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">投稿する</p>
                                <p className="text-xs text-gray-500">今すぐ公開するか、日時を指定して予約できます</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Primary CTA */}
                            <button
                                onClick={() => {
                                    const merged = flushAiToCaption()
                                    handlePublishNow(merged)
                                }}
                                disabled={isWorking || accounts.length === 0 || mediaFiles.length === 0}
                                className="flex-1 py-3.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                            >
                                {isWorking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                今すぐ投稿する
                            </button>

                            {/* Secondary CTA */}
                            <button
                                onClick={() => {
                                    flushAiToCaption()
                                    setActiveTab('schedule')
                                }}
                                disabled={isWorking || accounts.length === 0 || mediaFiles.length === 0}
                                className="flex-1 py-3.5 bg-white border-2 border-gray-200 text-gray-700 hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50 rounded-xl text-sm font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Calendar className="w-4 h-4" />
                                予約投稿に進む
                            </button>
                        </div>

                        {accounts.length === 0 && (
                            <p className="text-xs text-amber-600 mt-3 flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5" />
                                投稿するにはInstagramアカウントを<a href="/account" className="font-bold underline">連携</a>してください
                            </p>
                        )}
                    </div>

                    {/* ── Caption Templates & Hashtag helpers ── */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-5">
                        <div>
                            <p className="text-sm font-bold text-gray-900 mb-1">書き出しテンプレート</p>
                            <p className="text-xs text-gray-500 mb-3">クリックしてキャプションに追加</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {leadingSentences.map(s => (
                                    <button
                                        key={s.label}
                                        onClick={() => appendToCaption(s.text)}
                                        className="text-left p-3.5 rounded-xl border border-gray-100 bg-gray-50 hover:border-violet-200 hover:bg-violet-50/50 transition-all group"
                                    >
                                        <p className="text-[11px] font-bold text-violet-600 uppercase tracking-wide mb-1">{s.label}</p>
                                        <p className="text-sm text-gray-600 line-clamp-1 group-hover:text-gray-900 transition-colors">{s.text}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">ハッシュタグセット</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <select
                                            value={hashtags}
                                            onChange={e => setHashtags(e.target.value)}
                                            className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-4 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all cursor-pointer"
                                        >
                                            <option value="">カテゴリを選択</option>
                                            {Object.keys(hashtagSets).map(k => <option key={k}>{k}</option>)}
                                        </select>
                                        <Hash className="absolute right-8 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                    <button onClick={applyHashtags} disabled={!hashtags} className="px-4 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 disabled:opacity-40 transition-all">追加</button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">締めの一言 (CTA)</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <select
                                            value={ctaStyle}
                                            onChange={e => setCtaStyle(e.target.value)}
                                            className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-4 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all cursor-pointer"
                                        >
                                            {Object.keys(ctaEndings).map(k => <option key={k}>{k}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                    <button onClick={applyCTA} className="px-4 py-2.5 bg-gray-800 text-white rounded-xl text-sm font-bold hover:bg-gray-900 transition-all">追加</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════
                PUBLISH TAB
            ════════════════════════════════════════ */}
            {activeTab === 'publish' && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                        <p className="text-sm font-bold text-gray-900">アップロード & 今すぐ公開</p>
                        <p className="text-xs text-gray-500 mt-0.5">メディアとキャプションを設定して即時公開できます</p>
                    </div>
                    <div className="p-6 space-y-6">
                        <div>
                            <SectionLabel label="メディア" description="画像（複数）または動画を選択" />
                            <MediaUploadStrip
                                mediaFiles={mediaFiles}
                                setMediaFiles={setMediaFiles}
                                setMediaFile={setMediaFile}
                                setMediaPreview={setMediaPreview}
                                setIsVideo={setIsVideo}
                                isVideo={isVideo}
                            />
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <CaptionField value={caption} onChange={setCaption} />
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-3">
                            <button
                                onClick={() => handlePublishNow()}
                                disabled={isWorking || accounts.length === 0 || mediaFiles.length === 0}
                                className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-500/25 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                            >
                                {isWorking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                今すぐ公開する
                            </button>
                            <button
                                onClick={handleSaveDraft}
                                disabled={isWorking || accounts.length === 0}
                                className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
                            >
                                {isWorking && <Loader2 className="w-4 h-4 animate-spin" />}
                                下書き保存
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════
                SCHEDULE TAB
            ════════════════════════════════════════ */}
            {activeTab === 'schedule' && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                        <p className="text-sm font-bold text-gray-900">予約投稿</p>
                        <p className="text-xs text-gray-500 mt-0.5">投稿日時を指定して自動公開できます</p>
                    </div>
                    <div className="p-6 space-y-6">
                        <div>
                            <SectionLabel label="メディア" description="画像（複数）または動画を選択" />
                            <MediaUploadStrip
                                mediaFiles={mediaFiles}
                                setMediaFiles={setMediaFiles}
                                setMediaFile={setMediaFile}
                                setMediaPreview={setMediaPreview}
                                setIsVideo={setIsVideo}
                                isVideo={isVideo}
                            />
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <CaptionField value={caption} onChange={setCaption} />
                        </div>

                        <div className="pt-4 border-t border-gray-100 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">公開日時</label>
                                    <div className="relative group">
                                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-violet-500 transition-colors pointer-events-none" />
                                        <input
                                            type="datetime-local"
                                            value={scheduledFor}
                                            onChange={e => setScheduledFor(e.target.value)}
                                            min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000 + 60000).toISOString().slice(0, 16)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">ベスト投稿タイム</label>
                                    <div className="flex items-center gap-2 px-4 py-2.5 bg-violet-50 border border-violet-100 rounded-xl h-[42px]">
                                        <Activity className="w-4 h-4 text-violet-500 shrink-0" />
                                        <p className="text-xs font-semibold text-violet-700">火〜金：9〜11時、13〜15時、19〜21時</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => handleSchedule()}
                                    disabled={isWorking || !scheduledFor || accounts.length === 0 || mediaFiles.length === 0}
                                    className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-500/25 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                                >
                                    {isWorking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                                    予約を確定する
                                </button>
                                <button
                                    onClick={handleSaveDraft}
                                    disabled={isWorking || accounts.length === 0}
                                    className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
                                >
                                    下書き保存
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
