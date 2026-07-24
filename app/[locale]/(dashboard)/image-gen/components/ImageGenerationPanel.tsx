'use client'

import React from 'react'
import { Loader2, CheckCircle2, Wand2, Image as ImageIcon, X } from 'lucide-react'
import { useImageGen } from './ImageGenContext'
import { useTranslations } from 'next-intl'

export default function ImageGenerationPanel() {
    const t = useTranslations('ImageGen')
    const {
        isGeneratingImage,
        generationStatus,
        generationError,
        generatedImageUrl,
        handleRegenerate,
        handleCancel,
        discardImage,
        approveImage,
        setActiveTab,
    } = useImageGen()

    if (isGeneratingImage) {
        return (
            <div className="h-full w-full rounded-[20px] p-8 flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-surface/30 min-h-[400px] border border-gray-100 dark:border-card-border shadow-sm">
                <Loader2 className="w-12 h-12 animate-spin text-purple-500 mb-6" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-foreground mb-2">{t('generatingMasterpiece')}</h3>
                <p className="text-sm font-medium text-gray-500 dark:text-muted-text mb-6">
                    {generationStatus || t('generatingDesc')}
                </p>
                <button
                    type="button"
                    onClick={handleCancel}
                    className="px-5 py-2.5 bg-white dark:bg-card border border-gray-200 dark:border-card-border hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-semibold rounded-xl transition-colors shadow-sm"
                >
                    {t('cancelGeneration')}
                </button>
            </div>
        )
    }

    if (generatedImageUrl) {
        return (
            <div className="h-full w-full rounded-[20px] p-6 bg-white dark:bg-surface border border-gray-100 dark:border-card-border shadow-sm min-h-[400px] flex flex-col items-center">
                <div className="flex-1 w-full max-w-[320px] rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5 flex items-center justify-center relative aspect-[4/5] mx-auto shadow-md border border-gray-200 dark:border-card-border group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={generatedImageUrl} alt="Generated output" className="w-full h-full object-cover" />
                    <button
                        type="button"
                        onClick={discardImage}
                        className="absolute top-3 right-3 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm shadow-sm"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {generationError && (
                    <div className="text-sm text-red-500 mt-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800 w-full max-w-[320px]">
                        {generationError}
                    </div>
                )}

                <div className="flex gap-4 mt-6 w-full max-w-[320px]">
                    <button
                        type="button"
                        onClick={() => {
                            approveImage()
                            setActiveTab('image-library')
                        }}
                        className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 className="w-4 h-4" /> {t('approve')}
                    </button>
                    <button
                        type="button"
                        onClick={handleRegenerate}
                        className="flex-1 px-4 py-2.5 bg-white dark:bg-surface border border-gray-200 dark:border-card-border hover:bg-gray-50 dark:hover:bg-surface/80 text-gray-700 dark:text-foreground font-bold text-sm rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Wand2 className="w-4 h-4" /> {t('regenerate')}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full w-full rounded-[20px] p-8 flex flex-col items-center justify-center min-h-[400px] border border-gray-100 dark:border-card-border bg-gray-50/50 dark:bg-surface/30">
            <div className="flex flex-col items-center text-center max-w-sm">
                <ImageIcon className="w-24 h-24 text-gray-300 dark:text-gray-600 mb-6" strokeWidth={2} />
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-3">
                    {t('noImageYet')}
                </h3>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                    {t('writePromptHint')}
                </p>

                {generationError && (
                    <div className="mt-8 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
                        {generationError}
                    </div>
                )}
            </div>
        </div>
    )
}
