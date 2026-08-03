'use client'

import React from 'react'
import { Loader2, Wand2, Plus, FolderOpen, Copy, Trash2, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useImageGen, PromptTemplate, CATEGORY_LABEL_KEYS, TAG_LABEL_KEYS } from './ImageGenContext'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function PromptLibraryTab() {
    const t = useTranslations('ImageGen')
    const {
        savedTemplates,
        isLoadingTemplates,
        templatePage,
        setTemplatePage,
        templateTotalPages,
        loadTemplates,
        setActiveTab,
        selectedTemplate,
        setSelectedTemplate,
        handleUseTemplate,
        deleteConfirmId,
        setDeleteConfirmId,
        isDeletingId,
        handleDeleteTemplate,
    } = useImageGen()

    return (
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
                                                {CATEGORY_LABEL_KEYS[template.category] ? t(CATEGORY_LABEL_KEYS[template.category] as any) : template.category}
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
                                                    {TAG_LABEL_KEYS[tag] ? t(TAG_LABEL_KEYS[tag] as any) : tag}
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
                                            {!template.isSystem && (
                                                <>
                                                    {deleteConfirmId === template.id ? (
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => handleDeleteTemplate(template.id)}
                                                                disabled={isDeletingId === template.id}
                                                                className="px-2.5 py-1 text-[11px] font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                                            >
                                                                {isDeletingId === template.id ? <Loader2 className="w-3 h-3 animate-spin" /> : t('confirmBtn')}
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
            {!isLoadingTemplates && savedTemplates.length > 0 && templateTotalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-card-border">
                    <p className="text-xs text-muted-text">{t('pageOf', { page: templatePage, total: templateTotalPages })}</p>
                    <div className="flex gap-1.5">
                        <button
                            disabled={templatePage <= 1}
                            onClick={() => { setTemplatePage(p => p - 1); loadTemplates(templatePage - 1) }}
                            className="p-2 rounded-lg border border-card-border bg-surface hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            disabled={templatePage >= templateTotalPages}
                            onClick={() => { setTemplatePage(p => p + 1); loadTemplates(templatePage + 1) }}
                            className="p-2 rounded-lg border border-card-border bg-surface hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
