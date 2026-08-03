'use client'

import React from 'react'
import { Loader2, Sparkles, AlertCircle, FolderOpen, Trash2, X, Copy } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useImageGen, CATEGORY_LABEL_KEYS, TAG_LABEL_KEYS } from './ImageGenContext'

export default function TemplateDetailModal() {
    const t = useTranslations('ImageGen')
    const {
        selectedTemplate,
        setSelectedTemplate,
        deleteConfirmId,
        setDeleteConfirmId,
        isDeletingId,
        handleDeleteTemplate,
        handleUseTemplate,
    } = useImageGen()

    if (!selectedTemplate) return null

    return (
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
                                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/30 px-2 py-0.5 rounded-full shrink-0">{t('systemBadge')}</span>
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
                                    {CATEGORY_LABEL_KEYS[selectedTemplate.category] ? t(CATEGORY_LABEL_KEYS[selectedTemplate.category] as any) : selectedTemplate.category}
                                </span>
                            </div>
                        )}
                        {selectedTemplate.tags?.length > 0 && (
                            <div>
                                <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider block mb-1">{t('modalTagsLabel')}</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {selectedTemplate.tags.map((tag: string, i: number) => (
                                        <span key={i} className="text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 dark:bg-white/5 dark:text-muted-text dark:border-card-border px-2.5 py-1 rounded-md">
                                            {TAG_LABEL_KEYS[tag] ? t(TAG_LABEL_KEYS[tag] as any) : tag}
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
    )
}
