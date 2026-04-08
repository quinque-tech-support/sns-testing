'use client'

import { useState, useTransition, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Image as ImageIcon,
    Video,
    Calendar,
    Send,
    Plus,
    X,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Instagram,
    Sparkles,
    Images,
    FileImage,
    ChevronDown,
    ArrowRight
} from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

import { publishNow, schedulePost, getSignedUploadUrl, ActionResult } from './actions'
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
    accounts?: ConnectedAccount[] // Kept for backwards compatibility but not used
}

// ─────────────────────────────────────────────
// Multi-image upload strip
// ─────────────────────────────────────────────
function MediaUploadStrip({
    mediaFiles,
    setMediaFiles,
    setMediaFile,
    setIsVideo,
    isVideo,
}: {
    mediaFiles: File[]
    setMediaFiles: React.Dispatch<React.SetStateAction<File[]>>
    setMediaFile: React.Dispatch<React.SetStateAction<File | null>>
    setIsVideo: React.Dispatch<React.SetStateAction<boolean>>
    isVideo: boolean
}) {
    const handleFiles = (incoming: File[]) => {
        if (incoming.length === 0) return
        const first = incoming[0]
        const firstIsVideo = first.type.startsWith('video/')

        if (firstIsVideo) {
            setMediaFiles([first])
            setMediaFile(first)
            setIsVideo(true)
        } else {
            setMediaFiles(prev => {
                const filtered = prev.filter(f => !f.type.startsWith('video/'))
                return [...filtered, ...incoming.filter(f => !f.type.startsWith('video/'))]
            })
            setMediaFile(first)
            setIsVideo(false)
        }
    }

    const removeFile = (idx: number) => {
        setMediaFiles(prev => {
            const next = prev.filter((_, i) => i !== idx)
            if (next.length === 0) {
                setMediaFile(null)
                setIsVideo(false)
            } else {
                setMediaFile(next[0])
                setIsVideo(next[0].type.startsWith('video/'))
            }
            return next
        })
    }

    if (mediaFiles.length === 0) {
        return (
            <label className="group flex flex-col items-center justify-center min-h-[220px] bg-[#FAFAFA] rounded-xl border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 cursor-pointer">
                <div className="w-14 h-14 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-4 group-hover:scale-105 transition-all duration-200">
                    <FileImage className="w-6 h-6 text-gray-500" />
                </div>
                <p className="text-gray-800 font-medium text-sm">クリックまたはドラッグ＆ドロップ</p>
                <p className="text-gray-500 text-xs mt-1.5">画像（複数可）または動画・リール（1本）</p>
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
        <div className="space-y-4">
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                {mediaFiles.map((file, i) => (
                    <div key={i} className="relative shrink-0 snap-start">
                        {file.type.startsWith('video/') ? (
                            <div className="w-[140px] h-[140px] rounded-xl bg-gray-900 flex items-center justify-center border border-gray-200 shadow-sm">
                                <Video className="w-8 h-8 text-white/60" />
                                <span className="absolute bottom-2 left-2 text-[10px] bg-white/20 text-white backdrop-blur-md px-2 py-0.5 rounded font-medium">REEL</span>
                            </div>
                        ) : (
                            <img
                                src={URL.createObjectURL(file)}
                                className="w-[140px] h-[140px] rounded-xl object-cover border border-gray-200 shadow-sm"
                                alt={`media-${i}`}
                            />
                        )}
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeFile(i); }}
                            className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white backdrop-blur-md z-10 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ))}

                {!isVideo && (
                    <label className="shrink-0 w-[140px] h-[140px] rounded-xl border border-dashed border-gray-300 hover:border-gray-400 bg-[#FAFAFA] hover:bg-gray-50 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 gap-2">
                        <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                            <Plus className="w-4 h-4 text-gray-500" />
                        </div>
                        <span className="text-xs text-gray-500 font-medium">追加</span>
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
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 w-fit">
                    <Images className="w-4 h-4" />
                    <span>複数枚の画像はカルーセル投稿として公開されます</span>
                </div>
            )}
        </div>
    )
}

import { useAccount } from '../../components/AccountContext'

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
export default function CreateContentClient({ accounts: _ignored }: CreateContentPageProps) {
    const router = useRouter()
    const { selectedAccountId } = useAccount()

    const [mediaFile, setMediaFile] = useState<File | null>(null)
    const [mediaFiles, setMediaFiles] = useState<File[]>([])
    const [isVideo, setIsVideo] = useState(false)

    const [caption, setCaption] = useState('')
    const [customPrompt, setCustomPrompt] = useState('')

    // Reset caption safely when media is cleared
    useEffect(() => {
        if (mediaFiles.length === 0) {
            setCaption('')
            setCustomPrompt('')
        }
    }, [mediaFiles])

    const [scheduledFor, setScheduledFor] = useState('')
    const [showDatePicker, setShowDatePicker] = useState(false)
    
    const [result, setResult] = useState<ActionResult | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [isPending, startTransition] = useTransition()

    const [isGeneratingAI, setIsGeneratingAI] = useState(false)

    const clearResult = () => setResult(null)

    // Upload a single file and return its public URL
    const uploadSingleFile = async (file: File): Promise<string | null> => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
        const { token, path, error: urlError } = await getSignedUploadUrl(fileName, file.type)
        if (urlError || !token || !path) throw new Error(urlError || 'セキュアなアップロードURLの取得に失敗しました。')

        const { error: uploadError } = await supabase.storage
            .from('media-uploads')
            .uploadToSignedUrl(path, token, file, { cacheControl: '3600', upsert: false })

        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('media-uploads').getPublicUrl(path)
        return data.publicUrl
    }

    // Upload ALL selected files and return their public URLs
    const uploadAllMedia = async (): Promise<string[] | null> => {
        if (mediaFiles.length === 0) return null
        setIsUploading(true)
        try {
            const urls = await Promise.all(mediaFiles.map(f => uploadSingleFile(f)))
            if (urls.some(u => u === null)) throw new Error('一つまたは複数のファイルのアップロードに失敗しました。')
            return urls as string[]
        } catch (error) {
            console.error('Upload Error:', error)
            setResult({ error: 'メディアのアップロードに失敗しました。もう一度お試しください。' })
            return null
        } finally {
            setIsUploading(false)
        }
    }

    const buildFormData = (mediaUrls: string[]) => {
        const fd = new FormData()
        fd.set('caption', caption)
        fd.set('connectedAccountId', selectedAccountId)
        fd.set('isVideo', isVideo.toString())
        mediaUrls.forEach(url => fd.append('mediaUrls[]', url))
        if (mediaUrls.length > 0) fd.set('mediaUrl', mediaUrls[0])
        return fd
    }

    const handlePublishAction = async (mode: 'now' | 'schedule') => {
        if (isUploading || isPending) return
        if (mediaFiles.length === 0) {
            setResult({ error: '画像または動画をアップロードしてください。' })
            return
        }
        if (mode === 'schedule' && !scheduledFor) {
            setResult({ error: '予約投稿する日時を選択してください。' })
            return
        }

        const urls = await uploadAllMedia()
        if (!urls) return

        startTransition(async () => {
            const fd = buildFormData(urls)
            if (mode === 'schedule') {
                fd.set('scheduledFor', new Date(scheduledFor).toISOString())
                const res = await schedulePost(fd)
                setResult(res)
                if (res.success) setTimeout(() => router.push('/calendar'), 1500)
            } else {
                const res = await publishNow(fd)
                setResult(res)
                if (res.success) setTimeout(() => router.push('/dashboard'), 1500)
            }
        })
    }

    const handleGenerateCaption = async () => {
        const fileToUse = mediaFiles[0] || mediaFile
        if (!fileToUse) {
            setResult({ error: 'キャプションを生成するには、まず画像をアップロードしてください。' })
            return
        }

        setIsGeneratingAI(true)
        setResult(null)
        try {
            let imageBase64 = null
            let mimeType = null

            if (!fileToUse.type.startsWith('video/')) {
                const reader = new FileReader()
                const dataUrl = await new Promise<string>((resolve, reject) => {
                    reader.onload = () => resolve(reader.result as string)
                    reader.onerror = reject
                    reader.readAsDataURL(fileToUse)
                })
                imageBase64 = dataUrl
                mimeType = fileToUse.type
            }

            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64, mimeType, aiMode: 'personal', customPrompt }),
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error || 'AIキャプションの生成に失敗しました。')

            const newCaption = (json.caption + '\n\n' + (Array.isArray(json.hashtags) ? json.hashtags.join(' ') : '')).trim()
            setCaption(newCaption)
        } catch (error: any) {
            console.error('AI Gen error', error)
            setResult({ error: error.message || 'AIの生成に失敗しました。' })
        } finally {
            setIsGeneratingAI(false)
        }
    }

    const isWorking = isPending || isUploading || isGeneratingAI

    return (
        <div className="w-full max-w-full h-full flex flex-col space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">コンテンツ作成</h1>
                    <p className="text-sm text-gray-500 mt-1">メディアをアップロードし、キャプションを作成して公開します。</p>
                </div>

                
            </div>

            {/* Error / Success Banner */}
            {result && (
                <div className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium',
                    result.success
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                )}>
                    {result.success
                        ? <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                        : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    }
                    <span>{result.success ? '成功しました！リダイレクトしています...' : result.error}</span>
                    {!result.success && (
                        <button onClick={clearResult} className="ml-auto p-1.5 hover:bg-black/5 rounded-md transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )}

            {/* Form Container */}
            <form id="create-post-form" onSubmit={(e) => { e.preventDefault(); handlePublishAction('now'); }} className="bg-white border border-gray-200 rounded-xl overflow-hidden p-8 space-y-8 flex-1 flex flex-col">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
                    {/* Section 1: Media */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-900">メディア</label>
                        <MediaUploadStrip
                            mediaFiles={mediaFiles}
                            setMediaFiles={setMediaFiles}
                            setMediaFile={setMediaFile}
                            setIsVideo={setIsVideo}
                            isVideo={isVideo}
                        />
                    </div>

                    {/* Section 2: Caption */}
                    <div className="space-y-3 flex flex-col h-full">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-semibold text-gray-900">キャプション</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={customPrompt}
                                onChange={e => setCustomPrompt(e.target.value)}
                                placeholder="AIへの追加指示（プロンプト）があれば入力してください..."
                                className="flex-1 bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all shadow-sm"
                            />
                            <button
                                type="button"
                                onClick={handleGenerateCaption}
                                disabled={isWorking || mediaFiles.length === 0}
                                className={cn(
                                    "flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all border shrink-0",
                                    mediaFiles.length === 0
                                        ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                                        : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm active:scale-95"
                                )}
                            >
                                {isGeneratingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-indigo-500" />}
                                自動生成する
                            </button>
                        </div>
                        <div className="relative flex-1 flex flex-col">
                            <textarea
                                value={caption}
                                onChange={e => setCaption(e.target.value)}
                                placeholder="キャプションを入力、またはAIで自動生成..."
                                className="w-full h-full min-h-[220px] p-4 bg-[#FAFAFA] border border-gray-200 rounded-xl text-gray-900 text-sm leading-relaxed placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 focus:bg-white transition-all resize-none shadow-sm flex-1"
                                maxLength={2200}
                            />
                            <span className={cn(
                                'absolute bottom-3 right-3 text-[10px] font-medium px-2 py-1 rounded-md bg-white/80 backdrop-blur-sm border',
                                caption.length > 2000 ? 'text-red-500 border-red-200/50' : 'text-gray-400 border-gray-100/50'
                            )}>
                                {caption.length} / 2200
                            </span>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Submit Section */}
                <div className="pt-6 mt-6 border-t border-gray-100 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4">
                    <div className="w-full sm:w-auto flex-1">
                        {showDatePicker ? (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 animate-in fade-in slide-in-from-left-4">
                                <label className="text-xs font-semibold text-gray-500 whitespace-nowrap hidden sm:block">予約日時:</label>
                                <input
                                    type="datetime-local"
                                    value={scheduledFor}
                                    onChange={e => setScheduledFor(e.target.value)}
                                    min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000 + 60000).toISOString().slice(0, 16)}
                                    className="bg-white border border-gray-200 rounded-lg py-2.5 sm:py-2 pl-3 pr-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all shadow-sm w-full sm:max-w-[200px]"
                                />
                                <button
                                    type="button"
                                    onClick={() => handlePublishAction('schedule')}
                                    disabled={isWorking || !selectedAccountId || mediaFiles.length === 0 || !scheduledFor}
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-lg text-sm font-semibold transition-all shadow-md bg-purple-600 text-white hover:bg-purple-700 active:scale-95 disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none w-full sm:w-auto"
                                >
                                    <Calendar className="w-4 h-4" />
                                    予約を確定する
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowDatePicker(false)}
                                    className="hidden sm:flex p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="キャンセル"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setShowDatePicker(true)}
                                className="flex items-center justify-center w-full sm:w-auto gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors px-4 py-2.5 sm:py-2 rounded-lg bg-gray-100 hover:bg-gray-200/80 active:scale-95"
                            >
                                <Calendar className="w-4 h-4" />
                                予約投稿を設定...
                            </button>
                        )}
                    </div>

                    {!showDatePicker && (
                        <button
                            type="button"
                            onClick={() => handlePublishAction('now')}
                            disabled={isWorking || !selectedAccountId || mediaFiles.length === 0}
                            className={cn(
                                "w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold transition-all shadow-md active:scale-95",
                                "bg-black text-white hover:bg-gray-900 border border-black",
                                "disabled:bg-gray-100 disabled:text-gray-400 disabled:border-transparent disabled:cursor-not-allowed disabled:shadow-none disabled:active:scale-100"
                            )}
                        >
                            {isWorking ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                            今すぐ投稿する
                        </button>
                    )}
                </div>
            </form>
        </div>
    )
}
