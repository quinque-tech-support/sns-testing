'use client'

import React from 'react'
import { ChevronRight, Settings2, ChevronDown, CheckCircle2, Plus, X, Loader2, Sparkles } from 'lucide-react'
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
        isBuilding,
        projects,
        handleBuildPrompt
    } = useImageGen()

    return (
        <form onSubmit={handleBuildPrompt} className="bg-card border border-card-border rounded-2xl shadow-sm overflow-hidden h-full flex flex-col">
            {/* Project bar */}
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

            <div className="p-6 md:p-8 flex flex-col space-y-5 relative flex-1">
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
                                    className="w-full bg-surface border border-card-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all mt-2"
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
                                <div className="flex flex-wrap gap-1.5 p-3 bg-surface rounded-xl border border-card-border mt-2">
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

                <div className="flex-1"></div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isBuilding || !description}
                    className="w-full mt-5 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
        </form>
    )
}
