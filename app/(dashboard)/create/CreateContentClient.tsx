'use client'

import { useState, useEffect } from 'react'
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
    ChevronLeft,
    ChevronRight,
    ArrowRight,
    Search,
    FolderPlus,
    Trash2,
    Eye,
    History,
    MessageSquare,
    Heart,
    Bookmark,
    Settings,
    Upload,
    FileEdit,
    FolderKanban
} from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { MobilePreviewModal } from './components/MobilePreviewModal'
import { DraftSelectionModal } from './components/DraftSelectionModal'
import { HistorySelectionModal } from './components/HistorySelectionModal'
import { useMediaManagement } from './hooks/useMediaManagement'
import { usePostGeneration } from './hooks/usePostGeneration'
import { usePublishing } from './hooks/usePublishing'
import { useProjectData } from './hooks/useProjectData'
import { ConnectedAccount, HistoryItem } from './types'
import { saveDraft } from './actions'
import { useAccount } from '../../components/AccountContext'

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export default function CreateContentClient({ accounts: _ignored }: { accounts?: ConnectedAccount[] }) {
    const router = useRouter()
    const { selectedAccountId, accounts } = useAccount()

    // ─────────────────────────────────────────────
    // Hooks: all state and business logic is scoped below
    // ─────────────────────────────────────────────
    const {
        projects,
        selectedProjectId,
        setSelectedProjectId,
        selectedProject,
        isProjectsLoading,
        history,
        isLoadingHistory,
        drafts,
        isLoadingDrafts,
        projectImages,
        isLoadingProjectImages,
        isLibraryExpanded,
        setIsLibraryExpanded,
        isLibraryUploading,
        libraryUploadProgress,
        handleLibraryUpload,
        deleteProjectImage
    } = useProjectData()

    const {
        mediaItems,
        isVideo,
        handleFiles,
        removeMedia,
        clearMedia,
        loadFromDraft,
        loadFromHistory,
        loadFromLibrary
    } = useMediaManagement()

    const {
        caption,
        setCaption,
        customPrompt,
        setCustomPrompt,
        captionOptions,
        setCaptionOptions,
        selectedOptionIndex,
        isGeneratingAI,
        generationError,
        setGenerationError,
        generateCaption,
        applyCaptionOption
    } = usePostGeneration()

    const {
        result,
        setResult,
        clearResult,
        isPublishing,
        publish,
        saveAsDraft
    } = usePublishing()

    // Modal visibility
    const [showPreview, setShowPreview] = useState(false)
    const [showHistoryModal, setShowHistoryModal] = useState(false)
    const [showDraftsModal, setShowDraftsModal] = useState(false)
    const [previewIndex, setPreviewIndex] = useState(0)
    const [scheduledFor, setScheduledFor] = useState('')
    const [showDatePicker, setShowDatePicker] = useState(false)

    // Auto-append project default hashtags when project changes
    useEffect(() => {
        if (!selectedProject?.defaultHashtags?.length) return
        setCaption(prev => {
            const missing = selectedProject.defaultHashtags.filter(t => !prev.includes(t))
            if (missing.length === 0) return prev
            const appendage = missing.join(' ')
            return prev.trim() ? `${prev.trim()}\n\n${appendage}` : appendage
        })
    }, [selectedProject?.id])

    // Clear caption/options when media is removed
    useEffect(() => {
        if (mediaItems.length === 0) {
            setCaption('')
            setCustomPrompt('')
            setCaptionOptions([])
        }
    }, [mediaItems])

    // Surface generation errors as result banners
    useEffect(() => {
        if (generationError) {
            setResult({ error: generationError })
            setGenerationError(null)
        }
    }, [generationError])

    // ─────────────────────────────────────────────
    // Handlers (thin wrappers that glue hooks together)
    // ─────────────────────────────────────────────

    const handleSelectDraft = (draft: HistoryItem) => {
        loadFromDraft(draft)
        if (draft.caption) setCaption(draft.caption)
    }

    const handleSelectHistorical = (hist: HistoryItem) => {
        loadFromHistory(hist)
        if (hist.caption && !caption) setCaption(hist.caption)
    }

    const handlePublishAction = (mode: 'now' | 'schedule') => {
        publish(mode, {
            caption,
            selectedAccountId,
            selectedProjectId,
            isVideo,
            scheduledFor,
            mediaItems
        }, (publishMode) => {
            setTimeout(() => router.push(publishMode === 'schedule' ? '/calendar' : '/dashboard'), 1500)
        })
    }

    const handleSaveDraft = () => {
        saveAsDraft({
            caption,
            selectedAccountId,
            selectedProjectId,
            isVideo,
            mediaItems
        })
    }

    const handleGenerateCaption = () => {
        generateCaption(mediaItems, selectedProjectId)
    }

    const isWorking = isPublishing || isGeneratingAI
    const actAccount = accounts?.find(a => a.id === selectedAccountId)

    return (
        <div className="w-full max-w-full h-full flex flex-col space-y-4 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 pb-1">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    コンテンツ作成
                </h1>
                {!isProjectsLoading && projects.length > 0 && (
                    <div className="flex items-center gap-2 bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-200">
                        <FolderKanban className="w-4.5 h-4.5 text-indigo-500 shrink-0" />
                        <select
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            className="bg-transparent border-none text-sm font-bold text-gray-700 py-0 pr-6 pl-0.5 focus:ring-0 focus:outline-none cursor-pointer appearance-none"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' fill='none' viewBox='0 0 24 24' stroke='%236b7280' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 2px center' }}
                        >
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
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
                        onClick={() => router.push('/projects')}
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
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowDraftsModal(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 hover:text-amber-600 font-bold rounded-xl shadow-sm hover:bg-gray-50 hover:border-amber-200 transition-all text-xs"
                                >
                                    <FileEdit className="w-3.5 h-3.5" />下書きから編集
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowHistoryModal(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 hover:text-indigo-600 font-bold rounded-xl shadow-sm hover:bg-gray-50 hover:border-indigo-200 transition-all text-xs"
                                >
                                    <History className="w-3.5 h-3.5" />履歴から再利用
                                </button>
                            </div>
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

                        {/* ──────── 新デザインのメディアアップロード UI ──────── */}
                        <div className="space-y-4">
                                
                                {/* 1. デバイスからアップロード（メインカード） */}
                                {mediaItems.length === 0 && (
                                    <div className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors shadow-sm relative group overflow-hidden h-40 md:h-56">
                                        <input type="file" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept="image/*,video/*" onChange={e => handleFiles(Array.from(e.target.files || []))} />
                                        <div className="w-16 h-16 bg-blue-50/50 rounded-3xl flex items-center justify-center mb-4 group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-300">
                                            <Upload className="w-6 h-6 text-blue-500" />
                                        </div>
                                        <h3 className="text-base font-bold text-gray-900 mb-1">デバイスからアップロード</h3>
                                        <p className="text-sm text-gray-400 mb-4">ドラッグ＆ドロップ、またはクリックして参照</p>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                                            <span>JPG</span> • <span>PNG</span> • <span>WebP</span>
                                        </div>
                                    </div>
                                )}

                                {/* 2. ライブラリ（アコーディオン） */}
                                {selectedProjectId && (
                                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                                        <button 
                                            type="button" 
                                            onClick={() => setIsLibraryExpanded(!isLibraryExpanded)}
                                            className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                                                    <FolderPlus className="w-4 h-4 text-orange-500" />
                                                </div>
                                                <span className="font-bold text-gray-800">ライブラリ</span>
                                            </div>
                                            <ChevronDown className={cn("w-5 h-5 text-gray-400 transition-transform duration-300", isLibraryExpanded && "rotate-180")} />
                                        </button>
                                        
                                        <div className={cn("grid transition-[grid-template-rows] duration-300 ease-in-out", isLibraryExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                                            <div className="overflow-hidden">
                                                <div className="p-6 pt-0 border-t border-gray-100">
                                                    {isLibraryUploading ? (
                                                        <div className="flex flex-col items-center justify-center py-8 gap-2">
                                                            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                                                            <div className="w-full max-w-xs bg-gray-200 rounded-full h-1.5 mt-2 overflow-hidden">
                                                                <div className="bg-indigo-600 h-full rounded-full transition-all duration-300" style={{ width: `${libraryUploadProgress}%` }}></div>
                                                            </div>
                                                            <span className="text-xs text-gray-500 font-bold">{libraryUploadProgress}%</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col gap-4 mt-2">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs font-bold text-gray-400">{projectImages.length} 項目</span>
                                                                <label className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5">
                                                                    <Plus className="w-3 h-3"/>追加
                                                                    <input type="file" multiple className="hidden" accept="image/*" onChange={e => {
                                                                        const files = Array.from(e.target.files || [])
                                                                        if (files.length > 0) handleLibraryUpload(files)
                                                                        e.target.value = '' // reset so same file can be re-selected
                                                                    }} />
                                                                </label>
                                                            </div>

                                                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin">
                                                                {isLoadingProjectImages ? (
                                                                    <div className="col-span-full flex justify-center py-6">
                                                                        <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
                                                                    </div>
                                                                ) : projectImages.length > 0 ? (
                                                                    projectImages.map(img => (
                                                                        <div key={img.id} className="aspect-square relative rounded-xl border border-gray-200 overflow-hidden cursor-pointer group shadow-sm bg-gray-50" onClick={() => loadFromLibrary(img)}>
                                                                            <img src={img.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                                                                                <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-1 rounded-full border border-white/20">使う</span>
                                                                            </div>
                                                                            <button type="button" onClick={(e) => deleteProjectImage(img.id, e)} className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 hover:bg-red-500 rounded flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all border border-white/20">
                                                                                <Trash2 className="w-3 h-3" />
                                                                            </button>
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <div className="col-span-full py-8 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                                        <FolderPlus className="w-6 h-6 text-gray-300 mb-2" />
                                                                        <span className="text-xs text-gray-400 font-medium">画像がありません</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        {!selectedProjectId && mediaItems.length === 0 && (
                            <p className="text-xs text-gray-400 italic">※ プロジェクトを選択すると、ライブラリと履歴ギャラリーが有効になります。</p>
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
                                    <span>自動生成</span>
                                </button>
                            </div>

                            {/* Options Modal / In-place Switcher */}
                            {captionOptions.length > 0 && (
                                <div className="space-y-3 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 animate-in fade-in zoom-in-95">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-indigo-600 flex items-center gap-1"><Sparkles className="w-3 h-3"/> AIが最適なキャプションを生成しました</span>
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
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">ベストキャプション</span>
                                                        {opt.style && <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">{opt.style}</span>}
                                                    </div>
                                                    {opt.score != null && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md flex items-center gap-1"><Sparkles className="w-3 h-3"/> スコア: {opt.score}/10</span>}
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
                        <div className="relative flex-1 flex flex-col group min-h-[250px]">
                            <textarea
                                value={caption}
                                onChange={e => setCaption(e.target.value)}
                                placeholder="キャプションを入力、またはAIで自動生成..."
                                className={cn(
                                    "w-full h-full p-4 rounded-xl text-gray-900 text-sm leading-relaxed placeholder:text-gray-400 focus:outline-none transition-all resize-none shadow-sm flex-1 peer",
                                    caption.length > 0 
                                        ? "bg-blue-50/30 border-2 border-indigo-400 focus:ring-4 focus:ring-indigo-500/20" 
                                        : "bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-gray-400 focus:bg-white min-h-[200px]"
                                )}
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
                            onClick={handleSaveDraft}
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
                            {isPublishing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                            <span>今すぐ公開</span>
                        </button>
                    </div>
                </div>
            </form>
            )}

            {/* ─────────────────────────────────────────────
                Modals
            ───────────────────────────────────────────── */}

            {/* History Modal */}
            <HistorySelectionModal
                show={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
                selectedProjectId={selectedProjectId}
                historyItems={history}
                isLoadingHistory={isLoadingHistory}
                handleSelectHistory={handleSelectHistorical}
            />

            {/* Drafts Modal */}
            <DraftSelectionModal
                show={showDraftsModal}
                onClose={() => setShowDraftsModal(false)}
                selectedProjectId={selectedProjectId}
                drafts={drafts}
                isLoadingDrafts={isLoadingDrafts}
                handleSelectDraft={handleSelectDraft}
            />



            {/* Instagram Preview Modal */}
            <MobilePreviewModal 
                show={showPreview}
                onClose={() => setShowPreview(false)}
                mediaItems={mediaItems}
                caption={caption}
                previewIndex={previewIndex}
                setPreviewIndex={setPreviewIndex}
                account={actAccount}
            />
        </div>
    )
}
