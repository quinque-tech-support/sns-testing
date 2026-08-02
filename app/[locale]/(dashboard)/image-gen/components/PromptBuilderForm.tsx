'use client'

import React from 'react'
import { Sparkles, Save, Loader2, Settings2, ChevronDown, CheckCircle2, Plus, X, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useImageGen, DEFAULT_CATEGORIES, DEFAULT_TAGS } from './ImageGenContext'
import { twMerge } from './utils'

export default function PromptBuilderForm() {
    const t = useTranslations('ImageGen')
    const {
        description,
        setDescription,
        category,
        setCategory,
        isCustomCategory,
        setIsCustomCategory,
        selectedTags,
        setSelectedTags,
        customTagInput,
        setCustomTagInput,
        selectedProjectId,
        setSelectedProjectId,
        isAdvancedSettingsOpen,
        setIsAdvancedSettingsOpen,
        projects,
        handleGenerateImage,
        isGeneratingImage,
        generationStatus,
        handleSaveTemplate,
        isSavingTemplate,
        positivePrompt
    } = useImageGen()

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        handleGenerateImage()
    }

    return (
        <form onSubmit={onSubmit} className="bg-white dark:bg-card border border-gray-200 dark:border-card-border rounded-[20px] shadow-sm overflow-hidden flex flex-col p-5 md:p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">
                {t('imagePrompt')}
            </h2>

            <div className="flex flex-col space-y-4 relative">
                {/* Project Dropdown */}
                {projects && projects.length > 0 && (
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">
                            {t('projectName')}
                        </label>
                        <div className="relative">
                            <select
                                value={selectedProjectId}
                                onChange={e => setSelectedProjectId(e.target.value)}
                                className="w-full appearance-none bg-white dark:bg-surface border border-gray-300 dark:border-card-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all cursor-pointer text-gray-900 dark:text-white"
                            >
                                <option value="">{t('projectNone')}</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <ChevronRight className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 rotate-90" />
                        </div>
                    </div>
                )}

                {/* Description */}
                <div className="space-y-2 relative">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">
                        {t('descriptionPlain')}
                    </label>
                    <div className="relative">
                        <textarea
                            required
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder={t('descriptionPlaceholder')}
                            className="w-full bg-white dark:bg-surface border border-gray-300 dark:border-card-border rounded-xl p-4 pb-14 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all resize-none min-h-[110px] placeholder:text-gray-400 dark:placeholder:text-gray-600"
                        />
                        <div className="absolute bottom-3 right-3 group">
                            <button
                                type="button"
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-xs font-semibold rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors cursor-help"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                {t('geminiOptimized')}
                            </button>

                            {/* Rich Tooltip */}
                            <div className="absolute bottom-full right-0 mb-3 w-72 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 translate-y-1 group-hover:translate-y-0">
                                {/* Arrow */}
                                <div className="absolute bottom-[-6px] right-4 w-3 h-3 bg-white dark:bg-card border-r border-b border-gray-200 dark:border-card-border rotate-45 shadow-sm" />

                                {/* Card */}
                                <div className="bg-white dark:bg-card border border-gray-200 dark:border-card-border rounded-2xl shadow-xl overflow-hidden">
                                    {/* Header */}
                                    <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-b border-gray-100 dark:border-card-border">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                                            <Sparkles className="w-3.5 h-3.5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-900 dark:text-white">{t('geminiOptimizedTooltipTitle')}</p>
                                            <p className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">{t('expandedByAi')}</p>
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="px-4 py-3">
                                        {positivePrompt ? (
                                            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-6">
                                                {positivePrompt}
                                            </p>
                                        ) : (
                                            <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed italic">
                                                {t('geminiTooltip')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Advanced Settings Toggle */}
                <button
                    type="button"
                    onClick={() => setIsAdvancedSettingsOpen(!isAdvancedSettingsOpen)}
                    className="flex items-center gap-2 text-sm font-bold text-purple-600 dark:text-purple-400 hover:opacity-80 transition-opacity w-fit"
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
                            <label className="text-sm font-bold text-gray-900 dark:text-white">{t('category')}</label>
                            <div className="flex flex-wrap gap-2">
                                {DEFAULT_CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => { setCategory(cat); setIsCustomCategory(false) }}
                                        className={twMerge(
                                            "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                                            category === cat && !isCustomCategory
                                                ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                                                : "bg-white dark:bg-surface border-gray-200 dark:border-card-border hover:border-purple-300 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
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
                                            ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                                            : "bg-white dark:bg-surface border-gray-200 dark:border-card-border hover:border-purple-300 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
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
                                    className="w-full bg-white dark:bg-surface border border-gray-300 dark:border-card-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all mt-2"
                                />
                            )}
                        </div>

                        {/* Tags */}
                        <div className="space-y-2.5">
                            <label className="text-sm font-bold text-gray-900 dark:text-white">{t('tags')}</label>
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
                                                    ? "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30"
                                                    : "bg-white dark:bg-surface border-gray-200 dark:border-card-border hover:border-purple-300 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
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
                                className="w-full bg-white dark:bg-surface border border-gray-300 dark:border-card-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all"
                            />

                            {selectedTags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 p-3 bg-gray-50 dark:bg-surface rounded-xl border border-gray-200 dark:border-card-border mt-2">
                                    {selectedTags.map(tag => (
                                        <span key={tag} className="flex items-center gap-1.5 bg-white dark:bg-card border border-gray-200 dark:border-card-border text-xs font-medium px-2.5 py-1 rounded-md shadow-sm">
                                            {tag}
                                            <button type="button" onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))} className="text-gray-400 hover:text-red-500 transition-colors">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex flex-col gap-2">
                    <button
                        type="submit"
                        disabled={isGeneratingImage || !description}
                        className="w-full px-5 py-3 bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        {isGeneratingImage ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {generationStatus || t('generatingAction')}
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                {t('generateImageAction')}
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={handleSaveTemplate}
                        disabled={isSavingTemplate || !description}
                        className="w-full px-5 py-2.5 bg-white dark:bg-surface border border-gray-200 dark:border-card-border hover:bg-gray-50 dark:hover:bg-surface/80 text-gray-600 dark:text-gray-400 font-semibold rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        {isSavingTemplate ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-gray-400" />}
                        <span>{t('savePrompt')}</span>
                    </button>
                </div>
            </div>
        </form>
    )
}
