'use client'

import React from 'react'
import { Sparkles, Loader2, ChevronDown, AlertCircle, Save, Image as ImageIcon, CheckCircle2, Wand2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useImageGen } from './ImageGenContext'
import { twMerge } from './utils'

export default function ImageGenerationPanel() {
    const t = useTranslations('ImageGen')
    const {
        positivePrompt,
        negativePrompt,
        isBuilding,
        isPromptsOpen,
        setIsPromptsOpen,
        templateName,
        setTemplateName,
        isSavingTemplate,
        handleSaveTemplate,
        isGeneratingImage,
        generationStatus,
        generationError,
        generatedImageUrl,
        setGeneratedImageUrl,
        setActiveTab,
        handleGenerateImage,
        handleRegenerate
    } = useImageGen()

    if (!positivePrompt && !isBuilding) {
        return (
            <div className="h-full w-full border-2 border-dashed border-card-border/60 rounded-2xl p-8 flex flex-col items-center justify-center text-center opacity-70 bg-surface/30 min-h-[400px]">
                <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-muted-text opacity-40" />
                </div>
                <p className="text-sm font-medium text-muted-text">
                    Generated prompt will appear here
                </p>
            </div>
        )
    }

    return (
        <div className="h-full animate-in slide-in-from-right-4 fade-in duration-300 min-h-[400px]">
            <div className="h-full bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl p-6 space-y-5 flex flex-col">
                {isBuilding && (
                    <div className="flex flex-col items-center justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
                        <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">{t('building')}</p>
                    </div>
                )}

                {!isBuilding && positivePrompt && (
                    <>
                        <div className="bg-surface/50 rounded-xl border border-card-border overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setIsPromptsOpen(!isPromptsOpen)}
                                className="w-full flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            >
                                <span className="font-bold text-sm flex items-center gap-2 text-foreground">
                                    <Sparkles className="w-4 h-4 text-indigo-500" />
                                    {t('positivePrompt')} & {t('negativePrompt')}
                                </span>
                                <ChevronDown className={twMerge("w-4 h-4 text-muted-text transition-transform duration-200", isPromptsOpen ? "rotate-180" : "")} />
                            </button>
                            
                            <div className={twMerge(
                                "grid transition-all duration-300 ease-in-out",
                                isPromptsOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                            )}>
                                <div className="min-h-0 overflow-hidden">
                                    <div className="p-4 pt-0 space-y-4">
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
                                    </div>
                                </div>
                            </div>
                        </div>

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
                                onClick={handleGenerateImage}
                                disabled={isGeneratingImage || isBuilding}
                                className="w-full px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGeneratingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                                {isGeneratingImage ? `Generating (${generationStatus})...` : t('generateImage')}
                            </button>
                        </div>

                        {generationError && (
                            <div className="text-sm text-red-500 mt-2 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                                {generationError}
                            </div>
                        )}

                        {generatedImageUrl && (
                            <div className="mt-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-500">
                                <div className="rounded-xl overflow-hidden border border-card-border shadow-lg bg-surface">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={generatedImageUrl} alt="Generated output" className="w-full h-auto object-cover" />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setGeneratedImageUrl(null)
                                            setActiveTab('image-library')
                                        }}
                                        className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 className="w-4 h-4" /> Approve
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleRegenerate}
                                        disabled={isGeneratingImage}
                                        className="flex-1 px-4 py-2.5 bg-surface border border-card-border hover:bg-gray-50 dark:hover:bg-surface/80 text-foreground font-bold rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isGeneratingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                                        Regenerate
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
