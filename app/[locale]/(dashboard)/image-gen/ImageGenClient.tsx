'use client'

import { useTranslations } from 'next-intl'
import { BookOpen, Image as ImageIcon, Plus, CheckCircle2, AlertCircle, X } from 'lucide-react'

import { ImageGenProvider, ProjectMini, useImageGen } from './components/ImageGenContext'
import NewGenerationView from './components/NewGenerationView'
import PromptLibraryTab from './components/PromptLibraryTab'
import ImageLibraryTab from './components/ImageLibraryTab'
import TemplateDetailModal from './components/TemplateDetailModal'

function twMerge(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ')
}

// Inner component that consumes the context
function ImageGenInner() {
    const t = useTranslations('ImageGen')
    const { activeTab, setActiveTab, error, setError, successMessage, setSuccessMessage, resetForm } = useImageGen()

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
                    successMessage
                        ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
                        : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                )}>
                    {successMessage ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    <span>{successMessage || error}</span>
                    <button onClick={() => { setError(null); setSuccessMessage(null) }} className="ml-auto p-1.5 opacity-70 hover:opacity-100">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Tab Toggle Row */}
            <div className="flex justify-between items-center">
                <div className="flex gap-1 bg-surface border border-card-border rounded-xl p-1 w-fit">
                    <button
                        onClick={() => setActiveTab('library')}
                        className={twMerge(
                            'px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5',
                            activeTab === 'library' ? 'bg-indigo-600 text-white shadow-sm' : 'text-muted-text hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5'
                        )}
                    >
                        <BookOpen className="w-3.5 h-3.5" />
                        {t('promptLibrary')}
                    </button>
                    <button
                        onClick={() => setActiveTab('image-library')}
                        className={twMerge(
                            'px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5',
                            activeTab === 'image-library' ? 'bg-purple-600 text-white shadow-sm' : 'text-muted-text hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5'
                        )}
                    >
                        <ImageIcon className="w-3.5 h-3.5" />
                        {t('imageLibrary')}
                    </button>
                </div>

                <button
                    onClick={() => { resetForm(); setActiveTab('new') }}
                    className={twMerge(
                        'px-6 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shadow-sm border',
                        activeTab === 'new'
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'bg-surface border-card-border hover:bg-gray-100 dark:hover:bg-white/5'
                    )}
                >
                    <Plus className="w-3.5 h-3.5" />
                    {t('newPrompt')}
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'new' && <NewGenerationView />}
            {activeTab === 'library' && <PromptLibraryTab />}
            {activeTab === 'image-library' && <ImageLibraryTab />}

            {/* Template Detail Modal */}
            <TemplateDetailModal />
        </div>
    )
}

// Outer export wraps everything in the Provider
export default function ImageGenClient({ projects }: { projects?: ProjectMini[] }) {
    return (
        <ImageGenProvider projects={projects}>
            <ImageGenInner />
        </ImageGenProvider>
    )
}
