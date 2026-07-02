'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
    Loader2,
    CheckCircle2,
    AlertCircle,
    Sparkles,
    Save,
    Wand2,
    Image as ImageIcon,
    BookOpen,
    ChevronRight,
    ChevronDown,
    Settings2,
    X,
    Plus,
    Trash2,
    Copy,
    FolderOpen,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

function twMerge(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ')
}

const DEFAULT_CATEGORIES = ['Photography', 'Digital Art', 'Anime/Manga', '3D Render', 'Painting', 'Illustration']
const DEFAULT_TAGS = ['4k resolution', 'highly detailed', 'cinematic lighting', 'vibrant colors', 'dark & moody', 'macro photography', 'cyberpunk', 'fantasy']

interface ProjectMini {
    id: string
    name: string
    connectedAccountId?: string
    customPromptNotes?: string | null
    description?: string | null
    toneStyle?: string | null
}

interface PromptTemplate {
    id: string
    userId: string
    name: string
    description?: string | null
    category?: string | null
    tags: string[]
    positivePrompt: string
    negativePrompt?: string | null
    isSystem: boolean
    projectId?: string | null
    project?: { id: string; name: string } | null
    createdAt: string
    updatedAt: string
}

export default function ImageGenClient({ projects }: { projects?: ProjectMini[] }) {
    const t = useTranslations('ImageGen')
    const router = useRouter()

    const [activeTab, setActiveTab] = useState<'new' | 'library' | 'image-library'>('library')

    // New Prompt State
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('')
    const [isCustomCategory, setIsCustomCategory] = useState(false)
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [customTagInput, setCustomTagInput] = useState('')
    const [selectedProjectId, setSelectedProjectId] = useState<string>('')
    const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState(false)

    // Building State
    const [isBuilding, setIsBuilding] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    // Result State
    const [positivePrompt, setPositivePrompt] = useState('')
    const [negativePrompt, setNegativePrompt] = useState('')

    // Saved Prompts State
    const [savedTemplates, setSavedTemplates] = useState<PromptTemplate[]>([])
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)
    const [templateName, setTemplateName] = useState('')
    const [isSavingTemplate, setIsSavingTemplate] = useState(false)

    // Modal State
    const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null)
    const [isDeletingId, setIsDeletingId] = useState<string | null>(null)
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

    const hasLoadedInitialRef = useRef(false)

    useEffect(() => {
        if (activeTab === 'library') {
            loadTemplates()
        }
    }, [activeTab])

    const loadTemplates = async () => {
        setIsLoadingTemplates(true)
        try {
            const res = await fetch('/api/prompts/saved')
            const data = await res.json()
            if (res.ok) {
                setSavedTemplates(data)
                if (!hasLoadedInitialRef.current && data.length === 0) {
                    setActiveTab('new')
                }
                hasLoadedInitialRef.current = true
            } else {
                console.error(data.error)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoadingTemplates(false)
        }
    }

    const handleBuildPrompt = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!description) return

        setIsBuilding(true)
        setError(null)
        setSuccessMessage(null)
        setIsAdvancedSettingsOpen(false)

        let finalContext = ''
        if (selectedProjectId && projects) {
            const project = projects.find(p => p.id === selectedProjectId)
            if (project) {
                finalContext = `Project Name: ${project.name}. Description: ${project.description || 'None'}. Style/Tone: ${project.toneStyle || 'None'}. Notes: ${project.customPromptNotes || 'None'}`
            }
        }

        try {
            const buildRes = await fetch('/api/prompts/build', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description,
                    context: finalContext,
                    category,
                    tags: selectedTags
                })
            })

            const buildData = await buildRes.json()
            if (!buildRes.ok) throw new Error(buildData.error || 'Failed to build prompt')

            if (buildData.fallback) {
                setError(buildData.error || 'Failed to generate prompt. Showing fallback.')
            }

            setPositivePrompt(buildData.positivePrompt || '')
            setNegativePrompt(buildData.negativePrompt || '')

        } catch (err: any) {
            setError(err.message || 'An error occurred')
        } finally {
            setIsBuilding(false)
        }
    }

    const handleSaveTemplate = async () => {
        if (!templateName || !positivePrompt) return

        setIsSavingTemplate(true)
        try {
            const res = await fetch('/api/prompts/saved', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: templateName,
                    description,
                    category,
                    tags: selectedTags,
                    positivePrompt,
                    negativePrompt,
                    projectId: selectedProjectId || null,
                })
            })
            const data = await res.json()
            if (res.ok) {
                setSuccessMessage(t('saveSuccess'))
                setTemplateName('')
                setDescription('')
                setCategory('')
                setIsCustomCategory(false)
                setSelectedTags([])
                setCustomTagInput('')
                setPositivePrompt('')
                setNegativePrompt('')
                setActiveTab('library')
            } else {
                throw new Error(data.error || 'Failed to save template')
            }
        } catch (err: any) {
            setError(err.message || 'Failed to save template')
        } finally {
            setIsSavingTemplate(false)
        }
    }

    const handleDeleteTemplate = async (id: string) => {
        setIsDeletingId(id)
        try {
            const res = await fetch(`/api/prompts/saved/${id}`, { method: 'DELETE' })
            if (res.ok) {
                setSavedTemplates(prev => prev.filter(t => t.id !== id))
                if (selectedTemplate?.id === id) setSelectedTemplate(null)
                setDeleteConfirmId(null)
            } else {
                const data = await res.json()
                setError(data.error || 'Failed to delete template')
            }
        } catch (err: any) {
            setError(err.message || 'Failed to delete template')
        } finally {
            setIsDeletingId(null)
        }
    }

    const handleUseTemplate = (template: any) => {
        setPositivePrompt(template.positivePrompt)
        setNegativePrompt(template.negativePrompt || '')
        setDescription(template.description || '')

        const cat = template.category || ''
        setCategory(cat)
        if (cat && !DEFAULT_CATEGORIES.includes(cat)) {
            setIsCustomCategory(true)
        } else {
            setIsCustomCategory(false)
        }

        setSelectedTags(template.tags || [])

        if (template.projectId) {
            setSelectedProjectId(template.projectId)
        }

        setActiveTab('new')
        setSelectedTemplate(null)
    }

    const selectedProject = projects?.find(p => p.id === selectedProjectId)

    return (
        <div className="w-full max-w-6xl mx-auto h-full flex flex-col space-y-6 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold text-foreground tracking-tight">{t('title')}</h1>
            </div>

            {/* Error / Success Banner */}
            {(error || successMessage) && (
                <div className={twMerge(
                    'flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all',
                    successMessage ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400' : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                )}>
                    {successMessage ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    <span>{successMessage || error}</span>
                    <button onClick={() => { setError(null); setSuccessMessage(null); }} className="ml-auto p-1.5 opacity-70 hover:opacity-100">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Tab Toggle row */}
            <div className="flex justify-between items-center">
                {/* Left: Tabs */}
                <div className="flex gap-1 bg-surface border border-card-border rounded-xl p-1 w-fit">
                    <button
                        onClick={() => setActiveTab('library')}
                        className={twMerge(
                            "px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5",
                            activeTab === 'library' ? "bg-indigo-600 text-white shadow-sm" : "text-muted-text hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5"
                        )}
                    >
                        <BookOpen className="w-3.5 h-3.5" />
                        {t('promptLibrary')}
                    </button>
                    <button
                        onClick={() => setActiveTab('image-library')}
                        className={twMerge(
                            "px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5",
                            activeTab === 'image-library' ? "bg-purple-600 text-white shadow-sm" : "text-muted-text hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5"
                        )}
                    >
                        <ImageIcon className="w-3.5 h-3.5" />
                        {t('imageLibrary')}
                    </button>
                </div>

                {/* Right: New Prompt button */}
                <button
                    onClick={() => {
                        setDescription('')
                        setCategory('')
                        setIsCustomCategory(false)
                        setSelectedTags([])
                        setCustomTagInput('')
                        setPositivePrompt('')
                        setNegativePrompt('')
                        setTemplateName('')
                        setSuccessMessage('')
                        setError('')
                        setActiveTab('new')
                    }}
                    className={twMerge(
                        "px-6 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shadow-sm border",
                        activeTab === 'new'
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "bg-surface border-card-border hover:bg-gray-100 dark:hover:bg-white/5"
                    )}
                >
                    <Plus className="w-3.5 h-3.5" />
                    {t('newPrompt')}
                </button>
            </div>

            {/* ─── PROMPT BUILDER TAB ─────────────────────────────────────── */}
            {activeTab === 'new' && (
                <div className="flex flex-col gap-8">
                    <form onSubmit={handleBuildPrompt} className="bg-card border border-card-border rounded-2xl shadow-sm overflow-hidden">
                        {/* Project bar — full-width, separated by border */}
                        {projects && projects.length > 0 && (
                            <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-card-border bg-surface/50">
                                <span className="text-sm font-bold text-foreground">{t('project')}</span>
                                <div className="relative">
                                    <select
                                        value={selectedProjectId}
                                        onChange={e => setSelectedProjectId(e.target.value)}
                                        className="appearance-none bg-card border border-card-border rounded-lg pl-3 pr-8 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors shadow-sm cursor-pointer"
                                    >
                                        <option value="">{t('projectNone')}</option>
                                        {projects.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                    <ChevronRight className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-text rotate-90" />
                                </div>
                            </div>
                        )}

                        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Half: Form Controls */}
                            <div className="flex flex-col space-y-5 relative">
                            {/* Description */}
                            <div className="space-y-1.5 relative">
                                <label className="text-sm font-bold text-foreground block mb-1.5">
                                    {t('promptDescription')} <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    required
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder={t('promptDescriptionPlaceholder')}
                                    className="w-full bg-surface border border-card-border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all resize-none min-h-[100px]"
                                />
                            </div>

                            {/* Advanced Settings Toggle */}
                            <button
                                type="button"
                                onClick={() => setIsAdvancedSettingsOpen(!isAdvancedSettingsOpen)}
                                className="flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:opacity-80 transition-opacity w-fit"
                            >
                                <Settings2 className="w-4 h-4" />
                                {t('advancedSettings')}
                                <ChevronDown className={twMerge("w-4 h-4 transition-transform duration-200", isAdvancedSettingsOpen ? "rotate-180" : "")} />
                            </button>

                            {/* Advanced Settings Inline Content */}
                            <div className={twMerge(
                                "grid gap-5 overflow-hidden transition-all duration-300 ease-in-out",
                                isAdvancedSettingsOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                            )}>
                                <div className="min-h-0 space-y-6">
                                            {/* Category */}
                                            <div className="space-y-2.5">
                                                <label className="text-sm font-bold text-foreground">{t('category')}</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {DEFAULT_CATEGORIES.map(cat => (
                                                        <button
                                                            key={cat}
                                                            type="button"
                                                            onClick={() => { setCategory(cat); setIsCustomCategory(false) }}
                                                            className={twMerge(
                                                                "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                                                                category === cat && !isCustomCategory
                                                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                                                    : "bg-surface border-card-border hover:border-indigo-300 text-muted-text hover:text-foreground"
                                                            )}
                                                        >
                                                            {cat}
                                                        </button>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        onClick={() => { setCategory(''); setIsCustomCategory(true) }}
                                                        className={twMerge(
                                                            "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                                                            isCustomCategory
                                                                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                                                : "bg-surface border-card-border hover:border-indigo-300 text-muted-text hover:text-foreground"
                                                        )}
                                                    >
                                                        {t('categoryCustom')}
                                                    </button>
                                                </div>
                                                {isCustomCategory && (
                                                    <input
                                                        type="text"
                                                        value={category}
                                                        onChange={e => setCategory(e.target.value)}
                                                        placeholder={t('categoryCustomPlaceholder')}
                                                        className="w-full bg-surface border border-card-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                                                    />
                                                )}
                                            </div>

                                            {/* Tags */}
                                            <div className="space-y-2.5">
                                                <label className="text-sm font-bold text-foreground">{t('tags')}</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {DEFAULT_TAGS.map(tag => {
                                                        const isSelected = selectedTags.includes(tag)
                                                        return (
                                                            <button
                                                                key={tag}
                                                                type="button"
                                                                onClick={() => {
                                                                    if (isSelected) {
                                                                        setSelectedTags(prev => prev.filter(t => t !== tag))
                                                                    } else {
                                                                        setSelectedTags(prev => [...prev, tag])
                                                                    }
                                                                }}
                                                                className={twMerge(
                                                                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                                                                    isSelected
                                                                        ? "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30"
                                                                        : "bg-surface border-card-border hover:border-indigo-300 text-muted-text hover:text-foreground"
                                                                )}
                                                            >
                                                                {isSelected ? <CheckCircle2 className="w-3 h-3 inline-block mr-1 -ml-1" /> : <Plus className="w-3 h-3 inline-block mr-1 -ml-1" />}
                                                                {tag}
                                                            </button>
                                                        )
                                                    })}
                                                </div>

                                                <input
                                                    type="text"
                                                    value={customTagInput}
                                                    onChange={e => setCustomTagInput(e.target.value)}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter' || e.key === ',') {
                                                            e.preventDefault()
                                                            const val = customTagInput.trim()
                                                            if (val && !selectedTags.includes(val)) {
                                                                setSelectedTags(prev => [...prev, val])
                                                                setCustomTagInput('')
                                                            }
                                                        }
                                                    }}
                                                    placeholder={t('tagsCustomPlaceholder')}
                                                    className="w-full bg-surface border border-card-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                                                />

                                                {selectedTags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 p-3 bg-surface rounded-xl border border-card-border">
                                                        {selectedTags.map(tag => (
                                                            <span key={tag} className="flex items-center gap-1.5 bg-white dark:bg-card border border-card-border text-xs font-medium px-2.5 py-1 rounded-md shadow-sm">
                                                                {tag}
                                                                <button type="button" onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))} className="text-muted-text hover:text-red-500 transition-colors">
                                                                    <X className="w-3.5 h-3.5" />
                                                                </button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isBuilding || !description}
                                className="w-full px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isBuilding ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        {t('building')}
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        {t('buildPrompt')}
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Right Half: Output Preview */}
                        <div className="flex flex-col h-full min-h-[400px]">
                            {(positivePrompt || isBuilding) ? (
                                <div className="h-full animate-in slide-in-from-right-4 fade-in duration-300">
                                    <div className="h-full bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl p-6 space-y-5 flex flex-col">
                                        {isBuilding && (
                                            <div className="flex flex-col items-center justify-center py-8">
                                                <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
                                                <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">{t('building')}</p>
                                            </div>
                                        )}

                                        {!isBuilding && positivePrompt && (
                                            <>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                                                        <Sparkles className="w-4 h-4 text-indigo-500" />
                                                        {t('positivePrompt')}
                                                    </label>
                                                    <div className="w-full bg-white dark:bg-card border border-indigo-100 dark:border-indigo-500/20 rounded-xl p-4 text-sm leading-relaxed shadow-inner">
                                                        {positivePrompt}
                                                    </div>
                                                </div>

                                                {negativePrompt && (
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-bold text-rose-900 dark:text-rose-300 flex items-center gap-2">
                                                            <AlertCircle className="w-4 h-4 text-rose-500" />
                                                            {t('negativePrompt')}
                                                        </label>
                                                        <div className="w-full bg-white dark:bg-card border border-rose-100 dark:border-rose-500/20 rounded-xl p-4 text-sm leading-relaxed shadow-inner">
                                                            {negativePrompt}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="pt-4 border-t border-indigo-100 dark:border-indigo-500/20 flex flex-col gap-3">
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={templateName}
                                                            onChange={e => setTemplateName(e.target.value)}
                                                            placeholder={t('templateNamePlaceholder')}
                                                            className="flex-1 bg-white dark:bg-card border border-card-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={handleSaveTemplate}
                                                            disabled={isSavingTemplate || !templateName}
                                                            className="px-4 py-2.5 bg-white dark:bg-surface border border-card-border hover:bg-gray-50 dark:hover:bg-surface/80 text-foreground font-bold rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                                                        >
                                                            {isSavingTemplate ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                            <span className="hidden sm:inline">{t('saveTemplateBtn')}</span>
                                                        </button>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        disabled={true}
                                                        className="w-full px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <ImageIcon className="w-4 h-4" />
                                                        {t('generateImage')}
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full w-full border-2 border-dashed border-card-border/60 rounded-2xl p-8 flex flex-col items-center justify-center text-center opacity-70 bg-surface/30">
                                    <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4">
                                        <Sparkles className="w-8 h-8 text-muted-text opacity-40" />
                                    </div>
                                    <p className="text-sm font-medium text-muted-text">
                                        Generated prompt will appear here
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                </form>


                    {/* Image Library placeholder below form */}
                    <div className="bg-card border border-card-border rounded-2xl p-10 flex flex-col items-center justify-center text-center shadow-sm">
                        <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4">
                            <ImageIcon className="w-8 h-8 text-muted-text opacity-40" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">{t('imageLibraryPlaceholderTitle')}</h3>
                        <p className="text-sm text-muted-text mt-2 max-w-sm">
                            {t('imageLibraryPlaceholderDesc')}
                        </p>
                    </div>
                </div>
            )}

            {/* ─── PROMPT LIBRARY TAB ─────────────────────────────────────── */}
            {activeTab === 'library' && (
                <div className="bg-card border border-card-border rounded-2xl shadow-sm overflow-hidden">
                    {isLoadingTemplates ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                        </div>
                    ) : savedTemplates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
                            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mb-5">
                                <Wand2 className="w-10 h-10 text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground">{t('emptyLibraryTitle')}</h3>
                            <p className="text-sm text-muted-text mt-2 max-w-sm">
                                {t('emptyLibraryDesc')}
                            </p>
                            <div className="mt-6 flex items-center gap-2 text-sm text-muted-text">
                                <span>{t('emptyLibraryHintClick')}</span>
                                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-surface border border-card-border rounded-lg text-xs font-bold text-foreground shadow-sm">
                                    <Plus className="w-3.5 h-3.5 text-indigo-500" />
                                    {t('newPrompt')}
                                </span>
                                <span>{t('emptyLibraryHintAction')}</span>
                                <span className="text-lg">↑</span>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto w-full">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-surface/50 border-b border-card-border text-[11px] text-muted-text font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">{t('tablePromptTitle')}</th>
                                        <th className="px-6 py-4">{t('tableCategory')}</th>
                                        <th className="px-6 py-4">{t('tableProject')}</th>
                                        <th className="px-6 py-4">{t('tableTags')}</th>
                                        <th className="px-6 py-4 text-right">{t('tableActions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-card-border">
                                    {savedTemplates.map((template) => (
                                        <tr
                                            key={template.id}
                                            className="hover:bg-surface/50 transition-colors group cursor-pointer"
                                            onClick={() => setSelectedTemplate(template)}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-foreground flex items-center gap-2">
                                                    {template.name}
                                                    {template.isSystem && (
                                                        <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/30 px-2 py-0.5 rounded-full shrink-0">{t('systemBadge')}</span>
                                                    )}
                                                </div>
                                                {template.description && (
                                                    <div className="text-xs text-muted-text truncate max-w-xs mt-0.5">
                                                        {template.description}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {template.category ? (
                                                    <span className="text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 px-2.5 py-1 rounded-full">
                                                        {template.category}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-text text-xs">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {template.project ? (
                                                    <span className="text-xs font-semibold bg-purple-50 text-purple-600 border border-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20 px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                                                        <FolderOpen className="w-3 h-3" />
                                                        {template.project.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-muted-text">{t('noProject')}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-1.5 flex-wrap max-w-[200px]">
                                                    {template.tags?.slice(0, 2).map((tag: string, i: number) => (
                                                        <span key={i} className="text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 dark:bg-white/5 dark:text-muted-text dark:border-card-border px-2 py-0.5 rounded-md">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {template.tags?.length > 2 && (
                                                        <span className="text-xs text-muted-text px-2 py-0.5 rounded-md bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-card-border">
                                                            +{template.tags.length - 2}
                                                        </span>
                                                    )}
                                                    {(!template.tags || template.tags.length === 0) && (
                                                        <span className="text-muted-text text-xs">—</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                                                    {/* Use Template */}
                                                    <div className="relative group/tooltip">
                                                        <button
                                                            onClick={() => handleUseTemplate(template)}
                                                            className="p-2 text-muted-text hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </button>
                                                        <span className="pointer-events-none absolute -top-8 right-0 whitespace-nowrap bg-foreground text-background text-[11px] font-bold px-2 py-1 rounded-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-10">
                                                            {t('useTemplate')}
                                                        </span>
                                                    </div>

                                                    {/* Delete — disabled for system templates */}
                                                    {!template.isSystem && (
                                                        <>
                                                            {deleteConfirmId === template.id ? (
                                                                <div className="flex items-center gap-1">
                                                                    <button
                                                                        onClick={() => handleDeleteTemplate(template.id)}
                                                                        disabled={isDeletingId === template.id}
                                                                        className="px-2.5 py-1 text-[11px] font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                                                    >
                                                                        {isDeletingId === template.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirm'}
                                                                    </button>
                                                                    <button onClick={() => setDeleteConfirmId(null)} className="p-1.5 text-muted-text hover:text-foreground rounded-lg transition-colors">
                                                                        <X className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="relative group/tooltip">
                                                                    <button
                                                                        onClick={() => setDeleteConfirmId(template.id)}
                                                                        className="p-2 text-muted-text hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                    <span className="pointer-events-none absolute -top-8 right-0 whitespace-nowrap bg-foreground text-background text-[11px] font-bold px-2 py-1 rounded-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-10">
                                                                        {t('deletePrompt')}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ─── IMAGE LIBRARY TAB ──────────────────────────────────────── */}
            {activeTab === 'image-library' && (
                <div className="bg-card border border-card-border rounded-2xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-5">
                        <ImageIcon className="w-10 h-10 text-muted-text opacity-30" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{t('imageLibraryPlaceholderTitle')}</h3>
                    <p className="text-sm text-muted-text mt-2 max-w-sm">
                        {t('imageLibraryDesc')}
                    </p>
                </div>
            )}

            {/* ─── TEMPLATE DETAIL MODAL ──────────────────────────────────── */}
            {selectedTemplate && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setSelectedTemplate(null)}
                >
                    <div
                        className="bg-card w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-card-border flex items-start justify-between gap-4">
                            <div>
                                <h3 className="font-bold text-xl text-foreground flex items-center gap-2">
                                    {selectedTemplate.name}
                                    {selectedTemplate.isSystem && (
                                        <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/30 px-2 py-0.5 rounded-full shrink-0">System</span>
                                    )}
                                </h3>
                                {selectedTemplate.description && (
                                    <p className="text-sm text-muted-text mt-1">{selectedTemplate.description}</p>
                                )}
                            </div>
                            <button onClick={() => setSelectedTemplate(null)} className="p-2 hover:bg-surface rounded-full transition-colors text-muted-text hover:text-foreground shrink-0">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-5 bg-surface/30 max-h-[60vh] overflow-y-auto">
                            {/* Meta row */}
                            <div className="flex flex-wrap gap-3">
                                {selectedTemplate.project && (
                                    <div>
                                        <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider block mb-1">{t('modalProjectLabel')}</span>
                                        <span className="text-xs font-semibold bg-purple-50 text-purple-600 border border-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20 px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                                            <FolderOpen className="w-3 h-3" />
                                            {selectedTemplate.project.name}
                                        </span>
                                    </div>
                                )}
                                {selectedTemplate.category && (
                                    <div>
                                        <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider block mb-1">{t('modalCategoryLabel')}</span>
                                        <span className="text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 px-2.5 py-1 rounded-full">
                                            {selectedTemplate.category}
                                        </span>
                                    </div>
                                )}
                                {selectedTemplate.tags?.length > 0 && (
                                    <div>
                                        <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider block mb-1">{t('modalTagsLabel')}</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {selectedTemplate.tags.map((tag: string, i: number) => (
                                                <span key={i} className="text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 dark:bg-white/5 dark:text-muted-text dark:border-card-border px-2.5 py-1 rounded-md">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Positive prompt */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-indigo-500" />
                                    {t('positivePrompt')}
                                </label>
                                <div className="w-full bg-white dark:bg-card border border-indigo-100 dark:border-indigo-500/20 rounded-xl p-4 text-sm leading-relaxed shadow-inner">
                                    {selectedTemplate.positivePrompt}
                                </div>
                            </div>

                            {/* Negative prompt */}
                            {selectedTemplate.negativePrompt && (
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-rose-900 dark:text-rose-300 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-rose-500" />
                                        {t('negativePrompt')}
                                    </label>
                                    <div className="w-full bg-white dark:bg-card border border-rose-100 dark:border-rose-500/20 rounded-xl p-4 text-sm leading-relaxed shadow-inner">
                                        {selectedTemplate.negativePrompt}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-card-border flex items-center justify-between gap-3 bg-surface">
                            {/* Delete — only for non-system templates */}
                            <div>
                                {!selectedTemplate.isSystem && (
                                    <>
                                        {deleteConfirmId === selectedTemplate.id ? (
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted-text">{t('confirmDelete')}</span>
                                                <button
                                                    onClick={() => handleDeleteTemplate(selectedTemplate.id)}
                                                    disabled={isDeletingId === selectedTemplate.id}
                                                    className="px-3 py-1.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-1"
                                                >
                                                    {isDeletingId === selectedTemplate.id ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                                                    {t('deletePromptBtn')}
                                                </button>
                                                <button onClick={() => setDeleteConfirmId(null)} className="p-1.5 text-muted-text hover:text-foreground rounded-lg transition-colors">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setDeleteConfirmId(selectedTemplate.id)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                {t('deletePrompt')}
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedTemplate(null)}
                                    className="px-5 py-2.5 font-bold text-sm text-muted-text hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors"
                                >
                                    {t('modalClose')}
                                </button>
                                <button
                                    onClick={() => handleUseTemplate(selectedTemplate)}
                                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
                                >
                                    <Copy className="w-4 h-4" />
                                    {t('useTemplate')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
