'use client'

import React from 'react'
import { Loader2, Image as ImageIcon, RefreshCw, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useImageGen } from './ImageGenContext'

export default function ImageLibraryTab() {
    const t = useTranslations('ImageGen')
    const {
        savedImages,
        isLoadingImages,
        imagePage,
        setImagePage,
        imageTotalPages,
        loadImages,
        imageDeleteConfirmId,
        setImageDeleteConfirmId,
        isDeletingImageId,
        handleDeleteImage,
        handleGenerateSimilar,
    } = useImageGen()

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-300">
            {isLoadingImages ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            ) : savedImages.length === 0 ? (
                <div className="bg-card border border-card-border rounded-2xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-5">
                        <ImageIcon className="w-10 h-10 text-muted-text opacity-30" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{t('imageLibraryPlaceholderTitle')}</h3>
                    <p className="text-sm text-muted-text mt-2 max-w-sm">
                        {t('imageLibraryDesc')}
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {savedImages.map(image => (
                            <div key={image.id} className="group relative bg-card rounded-xl border border-card-border overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
                                <div className="aspect-square bg-surface relative overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={image.url}
                                        alt="AI Generated"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3 gap-2">
                                        <button
                                            onClick={() => handleGenerateSimilar(image.prompt || '', image.negativePrompt || '')}
                                            className="px-3 py-1.5 bg-white/90 hover:bg-white text-gray-900 text-[11px] font-bold rounded-lg backdrop-blur-sm transition-colors flex items-center gap-1.5 shadow-md"
                                            title={t('similarTooltip')}
                                        >
                                            <RefreshCw className="w-3.5 h-3.5" />
                                            {t('similarBtn')}
                                        </button>
                                        {imageDeleteConfirmId === image.id ? (
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleDeleteImage(image.id)}
                                                    disabled={isDeletingImageId === image.id}
                                                    className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1"
                                                >
                                                    {isDeletingImageId === image.id ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                                                    {t('confirmBtn')}
                                                </button>
                                                <button
                                                    onClick={() => setImageDeleteConfirmId(null)}
                                                    className="p-1.5 bg-white/80 hover:bg-white text-gray-700 rounded-lg transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setImageDeleteConfirmId(image.id)}
                                                className="p-1.5 bg-white/90 hover:bg-red-50 text-red-600 rounded-lg backdrop-blur-sm transition-colors shadow-md"
                                                title={t('deleteTooltip')}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="p-3 bg-card border-t border-card-border">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] text-muted-text">
                                            {new Date(image.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </p>
                                        {image.project ? (
                                            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 px-2 py-0.5 rounded-md truncate max-w-[100px]">
                                                {image.project.name}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] text-muted-text">{t('noProject')}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {imageTotalPages > 1 && (
                        <div className="flex items-center justify-between bg-card border border-card-border rounded-xl px-5 py-3">
                            <p className="text-xs text-muted-text">{t('pageOf', { page: imagePage, total: imageTotalPages })}</p>
                            <div className="flex gap-1.5">
                                <button
                                    disabled={imagePage <= 1}
                                    onClick={() => { setImagePage(p => p - 1); loadImages(imagePage - 1) }}
                                    className="p-2 rounded-lg border border-card-border bg-surface hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    disabled={imagePage >= imageTotalPages}
                                    onClick={() => { setImagePage(p => p + 1); loadImages(imagePage + 1) }}
                                    className="p-2 rounded-lg border border-card-border bg-surface hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
