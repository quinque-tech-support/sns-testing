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
        </div>
    )
}
