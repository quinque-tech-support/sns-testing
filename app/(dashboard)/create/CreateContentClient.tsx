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
    ArrowRight,
    Search,
    FolderPlus,
    Edit2,
    Trash2,
    Eye,
    History,
    MessageSquare,
    Heart,
    Bookmark,
    Settings
} from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

import { publishNow, schedulePost, saveDraft, getSignedUploadUrl, getProjectImageUploadUrl, registerProjectImages, ActionResult } from './actions'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface ConnectedAccount {
    id: string
    username: string | null
    pageId: string
    profilePictureUrl?: string | null
}

interface Project {
    id: string
    name: string
    description: string | null
    keywords: string | null
}

interface HistoryItem {
    id: string
    imageUrl: string
    mediaType: string
    createdAt: string
    likes: number
    views: number
    reach: number
    saves: number
    caption: string | null
}

interface ProjectImage {
    id: string
    url: string
    fileName: string
    createdAt: string
}

type MediaItem = 
    | { type: 'file'; file: File; id: string }
    | { type: 'url'; url: string; isVideo: boolean; id: string; libraryImageId?: string }


import { useAccount } from '../../components/AccountContext'

export default function CreateContentClient({ accounts: _ignored }: { accounts?: ConnectedAccount[] }) {
    const router = useRouter()
    const { selectedAccountId, accounts } = useAccount()

    // ─────────────────────────────────────────────
    // Projects State & History
    // ─────────────────────────────────────────────
    const [projects, setProjects] = useState<Project[]>([])
    const [selectedProjectId, setSelectedProjectId] = useState<string>('')
    const [isProjectsLoading, setIsProjectsLoading] = useState(true)
    
    // Project CRUD Modal State
    const [showProjectModal, setShowProjectModal] = useState(false)
    const [editingProject, setEditingProject] = useState<Project | null>(null)
    const [projName, setProjName] = useState('')
    const [projDesc, setProjDesc] = useState('')
    const [projKeywords, setProjKeywords] = useState('')

    const [history, setHistory] = useState<HistoryItem[]>([])
    const [isLoadingHistory, setIsLoadingHistory] = useState(false)
    const [projectImages, setProjectImages] = useState<ProjectImage[]>([])
    const [isLoadingProjectImages, setIsLoadingProjectImages] = useState(false)
    const [mediaTab, setMediaTab] = useState<'device' | 'library' | 'history'>('device')
    const [libraryUploadFiles, setLibraryUploadFiles] = useState<File[]>([])
    const [isLibraryUploading, setIsLibraryUploading] = useState(false)
    const [libraryUploadProgress, setLibraryUploadProgress] = useState(0)

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await fetch('/api/projects')
                if (res.ok) {
                    const data = await res.json()
                    setProjects(data)
                    if (data.length > 0 && !selectedProjectId) {
                        setSelectedProjectId(data[0].id)
                    }
                }
            } finally {
                setIsProjectsLoading(false)
            }
        }
        fetchProjects()
    }, [])

    useEffect(() => {
        if (!selectedProjectId) {
            setHistory([])
            setProjectImages([])
            setMediaTab('device')
            return
        }
        const fetchHistory = async () => {
            setIsLoadingHistory(true)
            try {
                const res = await fetch(`/api/projects/${selectedProjectId}/history`)
                if (res.ok) {
                    const data = await res.json()
                    setHistory(data.history || [])
                }
            } finally {
                setIsLoadingHistory(false)
            }
        }
        const fetchLibrary = async () => {
            setIsLoadingProjectImages(true)
            try {
                const res = await fetch(`/api/projects/${selectedProjectId}/images`)
                if (res.ok) {
                    const data = await res.json()
                    setProjectImages(data)
                }
            } finally {
                setIsLoadingProjectImages(false)
            }
        }
        fetchHistory()
        fetchLibrary()
        setMediaTab('library')
    }, [selectedProjectId])

    const handleSaveProject = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!projName) return
        try {
            if (editingProject) {
                const res = await fetch(`/api/projects/${editingProject.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: projName, description: projDesc, keywords: projKeywords })
                })
                if (res.ok) {
                    const updated = await res.json()
                    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p))
                }
            } else {
                const res = await fetch('/api/projects', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: projName, description: projDesc, keywords: projKeywords })
                })
                if (res.ok) {
                    const created = await res.json()
                    setProjects(prev => [created, ...prev])
                    setSelectedProjectId(created.id)
                }
            }
            setShowProjectModal(false)
            setEditingProject(null)
            setProjName(''); setProjDesc(''); setProjKeywords('')
        } catch (err) {
            console.error(err)
        }
    }

    const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm('このプロジェクトを削除しますか？\n（投稿は削除されません）')) return
        try {
            const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
            if (res.ok) {
                setProjects(prev => prev.filter(p => p.id !== id))
                if (selectedProjectId === id) setSelectedProjectId('')
            }
        } catch (err) {
            console.error(err)
        }
    }

    // ─────────────────────────────────────────────
    // Library Operations
    // ─────────────────────────────────────────────
    
    const handleLibraryUpload = async () => {
        if (libraryUploadFiles.length === 0 || !selectedProjectId) return
        setIsLibraryUploading(true)
        setLibraryUploadProgress(0)

        try {
            const uploadedUrls: { url: string; storagePath: string; fileName: string }[] = []
            
            for (let i = 0; i < libraryUploadFiles.length; i++) {
                const file = libraryUploadFiles[i]
                const { token, path, storagePath, publicUrl, error: urlError } = await getProjectImageUploadUrl(selectedProjectId, file.name, file.type)
                
                if (urlError || !token || !path || !storagePath || !publicUrl) {
                    console.error('Failed to get signed URL for file:', file.name)
                    continue
                }

                const { error: uploadError } = await supabase.storage
                    .from('media-uploads')
                    .uploadToSignedUrl(path, token, file, { cacheControl: '3600', upsert: false })

                if (!uploadError) {
                    uploadedUrls.push({ url: publicUrl, storagePath, fileName: file.name })
                }
                
                setLibraryUploadProgress(Math.round(((i + 1) / libraryUploadFiles.length) * 100))
            }

            if (uploadedUrls.length > 0) {
                const res = await registerProjectImages(selectedProjectId, uploadedUrls)
                if (res.count) {
                    // Refetch library
                    const fetchRes = await fetch(`/api/projects/${selectedProjectId}/images`)
                    if (fetchRes.ok) {
                        const data = await fetchRes.json()
                        setProjectImages(data)
                    }
                } else {
                    console.error('Register failed:', res.error)
                }
            }
        } catch (e) {
            console.error('Library upload error', e)
        } finally {
            setIsLibraryUploading(false)
            setLibraryUploadProgress(0)
            setLibraryUploadFiles([])
            setMediaTab('library')
        }
    }

    const handleDeleteProjectImage = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm('ライブラリからこの画像を削除しますか？')) return
        try {
            const res = await fetch(`/api/projects/${selectedProjectId}/images/${id}`, { method: 'DELETE' })
            if (res.ok) {
                setProjectImages(prev => prev.filter(img => img.id !== id))
            }
        } catch (err) {
            console.error('Delete image fail', err)
        }
    }

    // ─────────────────────────────────────────────
    // Media State
    // ─────────────────────────────────────────────
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
    const isVideo = mediaItems.length > 0 && (
        mediaItems[0].type === 'file' ? mediaItems[0].file.type.startsWith('video/') : mediaItems[0].isVideo
    )

    const handleFiles = (incoming: File[]) => {
        if (incoming.length === 0) return
        const first = incoming[0]
        const firstIsVideo = first.type.startsWith('video/')

        const newItems: MediaItem[] = incoming.map(f => ({ type: 'file', file: f, id: Math.random().toString() }))

        if (firstIsVideo) {
            setMediaItems([newItems[0]]) // Only 1 video allowed
        } else {
            setMediaItems(prev => {
                const filtered = prev.filter(item => item.type === 'file' ? !item.file.type.startsWith('video/') : !item.isVideo)
                return [...filtered, ...newItems.filter(item => item.type === 'file' && !item.file.type.startsWith('video/'))]
            })
        }
    }

    const removeMedia = (idToRemove: string) => {
        setMediaItems(prev => prev.filter(m => m.id !== idToRemove))
    }

    const handleSelectHistorical = (hist: HistoryItem) => {
        const isHistVideo = hist.mediaType === 'VIDEO'
        if (isHistVideo) {
            setMediaItems([{ type: 'url', url: hist.imageUrl, isVideo: true, id: Math.random().toString() }])
        } else {
            setMediaItems(prev => {
                const filtered = prev.filter(item => item.type === 'file' ? !item.file.type.startsWith('video/') : !item.isVideo)
                return [...filtered, { type: 'url', url: hist.imageUrl, isVideo: false, id: Math.random().toString() }]
            })
        }
        if (hist.caption && !caption) {
            setCaption(hist.caption)
        }
    }

    const handleSelectLibraryImage = (img: ProjectImage) => {
        setMediaItems(prev => {
            const filtered = prev.filter(item => item.type === 'file' ? !item.file.type.startsWith('video/') : !item.isVideo)
            return [...filtered, { type: 'url', url: img.url, isVideo: false, id: Math.random().toString(), libraryImageId: img.id }]
        })
    }

    // ─────────────────────────────────────────────
    // Post State
    // ─────────────────────────────────────────────
    const [caption, setCaption] = useState('')
    const [customPrompt, setCustomPrompt] = useState('')
    const [captionOptions, setCaptionOptions] = useState<any[]>([])

    const [scheduledFor, setScheduledFor] = useState('')
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [showPreview, setShowPreview] = useState(false)
    
    const [result, setResult] = useState<ActionResult | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [isGeneratingAI, setIsGeneratingAI] = useState(false)
    
    // Project management states
    const [showManageProjectsModal, setShowManageProjectsModal] = useState(false)

    // Reset caption safely when media is cleared
    useEffect(() => {
        if (mediaItems.length === 0) {
            setCaption('')
            setCustomPrompt('')
            setCaptionOptions([])
        }
    }, [mediaItems])

    const clearResult = () => setResult(null)

    // Upload files, pass through existing URLs
    const uploadAllMedia = async (): Promise<string[] | null> => {
        if (mediaItems.length === 0) return null
        setIsUploading(true)
        try {
            const urls = await Promise.all(mediaItems.map(async (item) => {
                if (item.type === 'url') return item.url 
                // Upload file
                const file = item.file
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
            }))
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
        if (selectedProjectId) fd.set('projectId', selectedProjectId)

        // Pass libraryImageId if a library image is selected
        const libraryItem = mediaItems.find(item => item.type === 'url') as Extract<MediaItem, { type: 'url' }> | undefined
        const firstLibraryId = libraryItem?.libraryImageId
        if (firstLibraryId) {
            fd.set('libraryImageId', firstLibraryId as string)
        }

        mediaUrls.forEach(url => fd.append('mediaUrls[]', url))
        if (mediaUrls.length > 0) fd.set('mediaUrl', mediaUrls[0])
        return fd
    }

    const handlePublishAction = async (mode: 'now' | 'schedule') => {
        if (isUploading || isPending) return
        if (mediaItems.length === 0) {
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
        const itemToUse = mediaItems[0]
        if (!itemToUse) {
            setResult({ error: 'キャプションを生成するには、まず画像を準備してください。' })
            return
        }

        setIsGeneratingAI(true)
        setCaptionOptions([])
        setResult(null)
        try {
            let imageBase64 = null
            let mimeType = null

            // If it's a new file and it's an image, pass it to Gemini
            if (itemToUse.type === 'file' && !itemToUse.file.type.startsWith('video/')) {
                const reader = new FileReader()
                const dataUrl = await new Promise<string>((resolve, reject) => {
                    reader.onload = () => resolve(reader.result as string)
                    reader.onerror = reject
                    reader.readAsDataURL(itemToUse.file)
                })
                imageBase64 = dataUrl
                mimeType = itemToUse.file.type
            }

            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    imageBase64, 
                    mimeType, 
                    aiMode: 'personal', 
                    customPrompt, 
                    currentCaption: caption,
                    projectId: selectedProjectId || undefined
                }),
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error || 'AIキャプションの生成に失敗しました。')

            if (json.options && json.options.length > 0) {
                setCaptionOptions(json.options)
            } else {
                const newCaption = (json.caption + '\n\n' + (Array.isArray(json.hashtags) ? json.hashtags.join(' ') : '')).trim()
                setCaption(newCaption)
            }
        } catch (error: any) {
            console.error('AI Gen error', error)
            setResult({ error: error.message || 'AIの生成に失敗しました。' })
        } finally {
            setIsGeneratingAI(false)
        }
    }

    const isWorking = isPending || isUploading || isGeneratingAI
    const actAccount = accounts?.find(a => a.id === selectedAccountId)

    return (
        <div className="w-full max-w-full h-full flex flex-col space-y-6 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">コンテンツ作成</h1>
                {/* Project Selector */}
                {!isProjectsLoading && (
                    <div className="flex items-center gap-2">
                        <select
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            className="bg-white border border-gray-200 text-sm rounded-xl px-4 py-2 focus:ring-2 focus:ring-black/5"
                        >
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={() => {
                                setEditingProject(null); setProjName(''); setProjDesc(''); setProjKeywords('');
                                setShowProjectModal(true)
                            }}
                            className="p-2 border border-gray-200 bg-white rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowManageProjectsModal(true)}
                            className="p-2 border border-gray-200 bg-white rounded-xl hover:bg-gray-50 transition-colors"
                            title="プロジェクトを管理"
                        >
                            <Settings className="w-4 h-4 text-gray-600" />
                        </button>
                    </div>
                )}
            </div>

            {/* Error / Success Banner */}
            {result && (
                <div className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium',
                    result.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
                )}>
                    {result.success ? <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
                    <span>{result.success ? '成功しました！リダイレクトしています...' : result.error}</span>
                    {!result.success && <button onClick={clearResult} className="ml-auto p-1.5"><X className="w-4 h-4" /></button>}
                </div>
            )}

            {/* Form Container */}
            {projects.length === 0 && !isProjectsLoading ? (
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden p-10 flex flex-col items-center justify-center space-y-4 shadow-sm min-h-[400px]">
                    <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center">
                        <FolderPlus className="w-8 h-8 text-indigo-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">プロジェクトを作成してください</h2>
                    <p className="text-gray-500 text-center max-w-sm">
                        コンテンツを作成するには、まずプロジェクト（ブランドやキャンペーンなど）を作成する必要があります。
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            setEditingProject(null); setProjName(''); setProjDesc(''); setProjKeywords('');
                            setShowProjectModal(true)
                        }}
                        className="mt-4 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        新規プロジェクトを作成
                    </button>
                </div>
            ) : (
                <form id="create-post-form" onSubmit={(e) => { e.preventDefault(); handlePublishAction('now'); }} className="bg-white border border-gray-200 rounded-2xl overflow-hidden p-6 md:p-8 space-y-8 shadow-sm">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Section 1: Media & Gallery */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-bold text-gray-900">メディア</label>
                        </div>
                        
                        {/* Currently Selected Media Strip */}
                        {mediaItems.length > 0 && (
                            <div className="flex gap-3 overflow-x-auto pb-4 snap-x relative">
                                {mediaItems.map((item) => {
                                    const src = item.type === 'file' ? URL.createObjectURL(item.file) : item.url
                                    return (
                                        <div key={item.id} className="relative shrink-0 snap-start group">
                                            {item.type === 'file' && item.file.type.startsWith('video/') || (item.type === 'url' && item.isVideo) ? (
                                                <div className="w-[140px] h-[140px] rounded-xl bg-gray-900 flex items-center justify-center border border-gray-200 shadow-sm relative overflow-hidden">
                                                    <img src={src} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="" />
                                                    <Video className="w-8 h-8 text-white/80 z-10" />
                                                    <span className="absolute bottom-2 left-2 text-[10px] bg-white/20 text-white backdrop-blur-md px-2 py-0.5 rounded font-medium z-10">REEL</span>
                                                </div>
                                            ) : (
                                                <img src={src} className="w-[140px] h-[140px] rounded-xl object-cover border border-gray-200 shadow-sm" alt="media" />
                                            )}
                                            <button
                                                type="button"
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeMedia(item.id); }}
                                                className="absolute top-2 right-2 w-6 h-6 bg-black/60 hover:bg-black/90 rounded-full flex items-center justify-center text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all z-20"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )
                                })}
                                {!isVideo && (
                                    <label className="shrink-0 w-[140px] h-[140px] rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 bg-gray-50 flex flex-col items-center justify-center cursor-pointer transition-all gap-2">
                                        <Plus className="w-5 h-5 text-gray-500" />
                                        <span className="text-xs text-gray-500 font-medium">追加</span>
                                        <input type="file" multiple className="hidden" accept="image/*" onChange={e => handleFiles(Array.from(e.target.files || []))} />
                                    </label>
                                )}
                            </div>
                        )}

                        {/* Upload Target / Gallery */}
                        {mediaItems.length === 0 && (
                            <div className="space-y-4">
                                {/* Tabs */}
                                {selectedProjectId && (
                                    <div className="flex bg-gray-100 p-1 rounded-lg">
                                        <button 
                                            type="button" 
                                            onClick={() => setMediaTab('library')}
                                            className={cn("flex-1 text-xs font-medium py-1.5 rounded-md transition-all", mediaTab === 'library' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700')}
                                        >
                                            📁 ライブラリ
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => setMediaTab('device')}
                                            className={cn("flex-1 text-xs font-medium py-1.5 rounded-md transition-all", mediaTab === 'device' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700')}
                                        >
                                            💻 デバイス
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => setMediaTab('history')}
                                            className={cn("flex-1 text-xs font-medium py-1.5 rounded-md transition-all", mediaTab === 'history' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700')}
                                        >
                                            📜 履歴
                                        </button>
                                    </div>
                                )}

                                {(!selectedProjectId || mediaTab === 'device') && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <label className="aspect-square relative rounded-xl border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 flex flex-col items-center justify-center cursor-pointer transition-all bg-white shadow-sm overflow-hidden group">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                <Plus className="w-5 h-5 text-blue-500" />
                                            </div>
                                            <span className="text-sm font-semibold text-gray-700">デバイスから</span>
                                            <span className="text-[10px] text-gray-400 mt-1">画像 / 動画を選択</span>
                                            <input type="file" multiple className="hidden" accept="image/*,video/*" onChange={e => handleFiles(Array.from(e.target.files || []))} />
                                        </label>
                                    </div>
                                )}

                                {selectedProjectId && mediaTab === 'library' && (
                                    <div className="space-y-4">
                                        {/* Dropzone for Library */}
                                        <div className="border border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 flex flex-col items-center justify-center gap-2">
                                            {isLibraryUploading ? (
                                                <div className="flex flex-col items-center gap-2 w-full max-w-xs">
                                                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                                                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 overflow-hidden">
                                                        <div className="bg-indigo-600 h-full rounded-full transition-all duration-300" style={{ width: `${libraryUploadProgress}%` }}></div>
                                                    </div>
                                                    <span className="text-xs text-gray-500">{libraryUploadProgress}%</span>
                                                </div>
                                            ) : (
                                                <>
                                                <label className="flex items-center justify-center gap-2 bg-white px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
                                                    <FolderPlus className="w-4 h-4 text-indigo-500"/>
                                                    <span className="text-xs font-bold text-gray-700">ライブラリに追加...</span>
                                                    <input type="file" multiple className="hidden" accept="image/*" onChange={e => {
                                                        setLibraryUploadFiles(Array.from(e.target.files || []));
                                                    }} />
                                                </label>
                                                {libraryUploadFiles.length > 0 && (
                                                    <div className="flex flex-col items-center gap-2 mt-2">
                                                        <span className="text-xs font-medium text-gray-600">{libraryUploadFiles.length} files selected</span>
                                                        <button type="button" onClick={handleLibraryUpload} className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white rounded-md text-xs font-bold shadow-sm">
                                                            アップロード開始
                                                        </button>
                                                    </div>
                                                )}
                                                </>
                                            )}
                                        </div>

                                        {/* Library Grid */}
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {isLoadingProjectImages ? (
                                                <div className="col-span-2 sm:col-span-3 flex justify-center py-6">
                                                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                                                </div>
                                            ) : projectImages.length > 0 ? (
                                                projectImages.map(img => (
                                                    <div key={img.id} className="aspect-square relative rounded-lg border border-gray-200 overflow-hidden cursor-pointer group shadow-sm bg-gray-100" onClick={() => handleSelectLibraryImage(img)}>
                                                        <img src={img.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <span className="text-[10px] font-bold text-white bg-black/50 px-2 py-1 rounded-full border border-white/20">これを使う</span>
                                                        </div>
                                                        <button type="button" onClick={(e) => handleDeleteProjectImage(img.id, e)} className="absolute top-2 right-2 w-6 h-6 bg-red-500 border border-red-400 hover:bg-red-600 rounded flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="col-span-2 sm:col-span-3 flex flex-col items-center justify-center bg-gray-50 py-8 rounded-xl border border-dashed border-gray-200 text-gray-400 text-xs">
                                                    <FolderPlus className="w-6 h-6 mb-2 opacity-50" />
                                                    <span>ライブラリに画像がありません</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {selectedProjectId && mediaTab === 'history' && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {isLoadingHistory ? (
                                            <div className="col-span-2 sm:col-span-3 aspect-square flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100">
                                                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                                            </div>
                                        ) : history.length > 0 ? (
                                            history.map((hist, idx) => (
                                                <div 
                                                    key={hist.id} 
                                                    onClick={() => handleSelectHistorical(hist)}
                                                    className={cn("aspect-square relative rounded-xl border border-gray-200 overflow-hidden cursor-pointer group shadow-sm bg-gray-100", idx >= 5 && "opacity-80 grayscale-[50%]")}
                                                >
                                                    <img src={hist.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <span className="text-[10px] font-bold text-white bg-black/50 px-2 py-1 rounded-full border border-white/20">再利用する</span>
                                                    </div>
                                                    {hist.mediaType === 'VIDEO' && (
                                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                            <Video className="w-6 h-6 text-white drop-shadow-lg" />
                                                        </div>
                                                    )}
                                                    {idx < 5 && (
                                                        <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-white font-bold flex items-center justify-center text-[10px] shadow-sm border border-gray-100">
                                                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx+1}`}
                                                        </div>
                                                    )}
                                                    <div className="absolute bottom-2 right-2 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded backdrop-blur border border-white/10 font-medium tracking-wide">
                                                        {new Date(hist.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-2 sm:col-span-3 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-xs py-8">
                                                <History className="w-6 h-6 mb-2 opacity-50" />
                                                <span>履歴データなし</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        {!selectedProjectId && mediaItems.length === 0 && (
                            <p className="text-xs text-gray-400 italic">※ プロジェクトを選択すると、過去の成功画像ギャラリーが表示されます。</p>
                        )}
                        {mediaItems.length > 1 && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50/50 border border-blue-100 rounded-lg text-xs text-blue-700 w-fit">
                                <Images className="w-4 h-4" />
                                <span>複数画像はカルーセルとして公開されます</span>
                            </div>
                        )}
                    </div>

                    {/* Section 2: Caption */}
                    <div className="space-y-4 flex flex-col h-full">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-bold text-gray-900">キャプション</label>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={customPrompt}
                                    onChange={e => setCustomPrompt(e.target.value)}
                                    placeholder="AIへの追加指示（プロンプト）..."
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all shadow-sm placeholder:text-gray-400"
                                />
                                <button
                                    type="button"
                                    onClick={handleGenerateCaption}
                                    disabled={isWorking || mediaItems.length === 0}
                                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all border shrink-0 bg-white border-gray-200 text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 hover:shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isGeneratingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                    自動生成
                                </button>
                            </div>

                            {/* Options Modal / In-place Switcher */}
                            {captionOptions.length > 0 && (
                                <div className="space-y-3 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 animate-in fade-in zoom-in-95">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-indigo-600 flex items-center gap-1"><Sparkles className="w-3 h-3"/> AIが {captionOptions.length} つのオプションを作成しました</span>
                                        <button onClick={() => setCaptionOptions([])} type="button" className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4"/></button>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        {captionOptions.map((opt, idx) => (
                                            <div 
                                                key={idx} 
                                                onClick={() => {
                                                    setCaption(`${opt.caption}\n\n${(opt.hashtags || []).join(' ')}`);
                                                    setCaptionOptions([]) // close options
                                                }}
                                                className="w-full bg-white p-5 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:border-indigo-400 hover:ring-2 hover:ring-indigo-100 transition-all group"
                                            >
                                                <div className="flex items-start justify-between mb-3 border-b border-gray-50 pb-2">
                                                    <span className="text-sm font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">オプション {idx + 1}</span>
                                                    {opt.rationale && <span className="text-xs text-gray-500 italic max-w-[60%] text-right bg-blue-50/50 px-2.5 py-1 rounded-md">{opt.rationale}</span>}
                                                </div>
                                                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{opt.caption}</p>
                                                {opt.hashtags && opt.hashtags.length > 0 && (
                                                    <div className="mt-3 text-xs text-blue-600 font-medium">
                                                        {opt.hashtags.join(' ')}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                        <div className="relative flex-1 flex flex-col group">
                            <textarea
                                value={caption}
                                onChange={e => setCaption(e.target.value)}
                                placeholder="キャプションを入力、またはAIで自動生成..."
                                className="w-full h-full min-h-[200px] p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm leading-relaxed placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 focus:bg-white transition-all resize-none shadow-sm flex-1 peer group-focus-within:bg-white group-focus-within:shadow-md"
                                maxLength={2200}
                            />
                            <div className="absolute bottom-3 right-3 flex items-center gap-2">
                                <span className={cn(
                                    'text-[10px] font-bold px-2 py-1 rounded-md transition-colors border',
                                    caption.length > 2000 ? 'bg-red-50 text-red-500 border-red-100' : 'bg-white/80 text-gray-400 border-gray-200 shadow-sm peer-focus:border-gray-300 peer-focus:text-gray-500'
                                )}>
                                    {caption.length} / 2200
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Submit Controls Fixed to Bottom of Form */}
                <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4">
                    <div className="w-full sm:w-auto flex flex-col sm:flex-row sm:items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setShowPreview(true)}
                            disabled={mediaItems.length === 0}
                            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto shadow-sm"
                        >
                            <Eye className="w-4 h-4" />
                            プレビュー
                        </button>

                        <button
                            type="button"
                            onClick={async () => {
                                if (isWorking) return
                                const urls = mediaItems.length > 0 ? await uploadAllMedia() : null
                                startTransition(async () => {
                                    const fd = new FormData()
                                    fd.set('caption', caption)
                                    fd.set('connectedAccountId', selectedAccountId)
                                    fd.set('isVideo', isVideo.toString())
                                    if (selectedProjectId) fd.set('projectId', selectedProjectId)
                                    if (urls && urls.length > 0) fd.set('mediaUrl', urls[0])
                                    const res = await saveDraft(fd)
                                    setResult(res)
                                    if (res.success) setTimeout(() => router.push('/workflow'), 1500)
                                })
                            }}
                            disabled={isWorking || !selectedAccountId || (mediaItems.length === 0 && !caption.trim())}
                            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 w-full sm:w-auto"
                        >
                            <FileImage className="w-4 h-4" />
                            下書き
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                        {!showDatePicker ? (
                            <button
                                type="button"
                                onClick={() => setShowDatePicker(true)}
                                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:scale-95 w-full sm:w-auto"
                            >
                                <Calendar className="w-4 h-4" />
                                予約を設定...
                            </button>
                        ) : (
                            <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 bg-gray-50 p-1.5 rounded-xl border border-gray-200 w-full sm:w-auto">
                                <input
                                    type="datetime-local"
                                    value={scheduledFor}
                                    onChange={e => setScheduledFor(e.target.value)}
                                    min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000 + 60000).toISOString().slice(0, 16)}
                                    className="bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 w-full sm:w-auto"
                                />
                                <button
                                    type="button"
                                    onClick={() => handlePublishAction('schedule')}
                                    disabled={isWorking || !selectedAccountId || mediaItems.length === 0 || !scheduledFor}
                                    className="flex items-center justify-center px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-md bg-purple-600 text-white hover:bg-purple-700 active:scale-95 disabled:opacity-50 w-full sm:w-auto shrink-0"
                                >
                                    完了
                                </button>
                                <button type="button" onClick={() => setShowDatePicker(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"><X className="w-5 h-5" /></button>
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={() => handlePublishAction('now')}
                            disabled={isWorking || !selectedAccountId || mediaItems.length === 0}
                            className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-xl shadow-black/10 active:scale-95 bg-black text-white hover:bg-gray-900 border border-black disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isWorking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                            今すぐ公開
                        </button>
                    </div>
                </div>
            </form>
            )}

            {/* ─────────────────────────────────────────────
                Modals
            ───────────────────────────────────────────── */}

            {/* Manage Projects Modal */}
            {showManageProjectsModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-in zoom-in-95 max-h-[85vh] flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">プロジェクトを管理</h2>
                            <button type="button" onClick={() => setShowManageProjectsModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5"/>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                            {projects.length === 0 ? (
                                <p className="text-center text-gray-500 py-8 text-sm">プロジェクトがありません</p>
                            ) : (
                                projects.map(proj => (
                                    <div key={proj.id} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-3">
                                        <div className="flex flex-col min-w-0 pr-4">
                                            <p className="font-bold text-gray-900 text-sm truncate">{proj.name}</p>
                                            {proj.keywords && <p className="text-xs text-gray-500 truncate mt-0.5">{proj.keywords}</p>}
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingProject(proj); setProjName(proj.name); setProjDesc(proj.description || ''); setProjKeywords(proj.keywords || '');
                                                    setShowManageProjectsModal(false)
                                                    setShowProjectModal(true)
                                                }}
                                                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200"
                                                title="編集"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => handleDeleteProject(proj.id, e)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200"
                                                title="削除"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Project Modal */}
            {showProjectModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <form onSubmit={handleSaveProject} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <FolderPlus className="w-5 h-5 text-indigo-600" />
                                {editingProject ? 'プロジェクトを編集' : '新規プロジェクト'}
                            </h2>
                            <button type="button" onClick={() => setShowProjectModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">名前 *</label>
                                <input required type="text" value={projName} onChange={e=>setProjName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all" placeholder="例: 夏のキャンペーン" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">説明 / 世界観</label>
                                <textarea value={projDesc} onChange={e=>setProjDesc(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 min-h-[80px] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all" placeholder="AIへの指示として使われます" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">キーワード</label>
                                <input type="text" value={projKeywords} onChange={e=>setProjKeywords(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all" placeholder="例: トレンド, エモい, 青色" />
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 mt-8">
                            {editingProject && (
                                <button type="button" onClick={(e) => handleDeleteProject(editingProject.id, e)} className="mr-auto text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
                            )}
                            <button type="button" onClick={() => setShowProjectModal(false)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">キャンセル</button>
                            <button type="submit" className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all active:scale-95">保存</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Instagram Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowPreview(false)}>
                    <div className="bg-white rounded-[2.5rem] w-[350px] max-h-[80vh] shadow-2xl flex flex-col overflow-hidden relative" onClick={e => e.stopPropagation()}>
                        {/* Dynamic Island / Status Bar area fake */}
                        <div className="h-6 w-full flex justify-center pt-2 bg-white z-10 shrink-0">
                            <div className="w-20 h-4 bg-black rounded-full" />
                        </div>
                        
                        {/* Header */}
                        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
                                    <div className="w-full h-full rounded-full bg-white border border-transparent overflow-hidden">
                                        {(actAccount && 'profilePictureUrl' in actAccount && actAccount.profilePictureUrl) ? (
                                            <img src={actAccount.profilePictureUrl as string} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <Instagram className="w-full h-full p-1 text-gray-400" />
                                        )}
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-gray-900">{actAccount?.username || 'username'}</span>
                            </div>
                            <span className="text-gray-900 font-bold tracking-widest text-xs">...</span>
                        </div>

                        {/* Media */}
                        <div className="w-full aspect-square bg-gray-100 relative shrink-0">
                            {mediaItems.length > 0 && (
                                <img 
                                    src={mediaItems[0].type === 'file' ? URL.createObjectURL(mediaItems[0].file) : mediaItems[0].url} 
                                    className="w-full h-full object-cover" 
                                    alt="Preview" 
                                />
                            )}
                            {mediaItems.length > 1 && (
                                <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">1/{mediaItems.length}</div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="px-3 py-2 shrink-0">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex gap-4">
                                    <Heart className="w-6 h-6 text-gray-900" />
                                    <MessageSquare className="w-6 h-6 text-gray-900" />
                                    <Send className="w-6 h-6 text-gray-900" />
                                </div>
                                <Bookmark className="w-6 h-6 text-gray-900" />
                            </div>
                            <p className="text-xs font-bold text-gray-900 mb-1">0 likes</p>
                        </div>

                        {/* Caption Scrollable Area */}
                        <div className="px-3 pb-6 flex-1 overflow-y-auto min-h-0">
                            <p className="text-sm text-gray-900 whitespace-pre-wrap">
                                <span className="font-bold mr-2">{actAccount?.username || 'username'}</span>
                                {caption || 'キャプションがここに表示されます...'}
                            </p>
                        </div>
                        
                        <button onClick={() => setShowPreview(false)} className="absolute -top-12 right-0 text-white hover:text-gray-300 p-2"><X className="w-8 h-8"/></button>
                    </div>
                </div>
            )}
        </div>
    )
}
