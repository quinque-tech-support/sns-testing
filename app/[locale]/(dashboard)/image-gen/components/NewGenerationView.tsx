'use client'

import React from 'react'
import PromptBuilderForm from './PromptBuilderForm'
import ImageGenerationPanel from './ImageGenerationPanel'
import { Image as ImageIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function NewGenerationView() {
    const t = useTranslations('ImageGen')
    return (
        <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                <PromptBuilderForm />
                <ImageGenerationPanel />
            </div>

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
    )
}
