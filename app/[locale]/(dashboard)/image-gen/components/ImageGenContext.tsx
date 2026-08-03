'use client'

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'

export const DEFAULT_CATEGORIES = ['Photography', 'Digital Art', 'Anime/Manga', '3D Render', 'Painting', 'Illustration']
export const DEFAULT_TAGS = ['4k resolution', 'highly detailed', 'cinematic lighting', 'vibrant colors', 'dark & moody', 'macro photography', 'cyberpunk', 'fantasy']

export interface ProjectMini {
    id: string
    name: string
    connectedAccountId?: string
    customPromptNotes?: string | null
    description?: string | null
    toneStyle?: string | null
}

export interface PromptTemplate {
    id: string
    userId: string
    name: string
    description?: string | null
    category?: string | null
    tags: string[]
    positivePrompt: string
    negativePrompt?: string | null
    isSystem: boolean
    projectId?: string | null
    project?: { id: string; name: string } | null
    createdAt: string
    updatedAt: string
}

export interface ImageGenContextType {
    activeTab: 'new' | 'library' | 'image-library'
    setActiveTab: (tab: 'new' | 'library' | 'image-library') => void
    projects?: ProjectMini[]

    // Prompt Form State
    description: string
    setDescription: (val: string) => void
    category: string
    setCategory: (val: string) => void
    isCustomCategory: boolean
    setIsCustomCategory: (val: boolean) => void
    selectedTags: string[]
    setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>
    customTagInput: string
    setCustomTagInput: (val: string) => void
    selectedProjectId: string
    setSelectedProjectId: (val: string) => void
    isAdvancedSettingsOpen: boolean
    setIsAdvancedSettingsOpen: (val: boolean) => void

    // UI Feedback State
    error: string | null
    setError: (val: string | null) => void
    successMessage: string | null
    setSuccessMessage: (val: string | null) => void

    // Built Prompt State
    positivePrompt: string
    setPositivePrompt: (val: string) => void
    negativePrompt: string
    setNegativePrompt: (val: string) => void

    // Prompt Library State
    savedTemplates: PromptTemplate[]
    isLoadingTemplates: boolean
    isSavingTemplate: boolean
    templatePage: number
    setTemplatePage: React.Dispatch<React.SetStateAction<number>>
    templateTotalPages: number
    selectedTemplate: PromptTemplate | null
    setSelectedTemplate: (val: PromptTemplate | null) => void
    isDeletingId: string | null
    deleteConfirmId: string | null
    setDeleteConfirmId: (val: string | null) => void

    // Image Library State
    savedImages: any[]
    isLoadingImages: boolean
    imagePage: number
    setImagePage: React.Dispatch<React.SetStateAction<number>>
    imageTotalPages: number
    imageDeleteConfirmId: string | null
    setImageDeleteConfirmId: (val: string | null) => void
    isDeletingImageId: string | null

    // Image Generation State
    isGeneratingImage: boolean
    generationStatus: string | null
    generatedImageUrl: string | null
    generationError: string | null

    // Functions
    loadTemplates: (page?: number) => Promise<void>
    loadImages: (page?: number) => Promise<void>
    handleDeleteImage: (id: string) => Promise<void>
    handleGenerateSimilar: (prompt: string, negPrompt?: string) => void
    handleGenerateImage: () => Promise<void>
    handleRegenerate: () => Promise<void>
    handleSaveTemplate: () => Promise<void>
    handleDeleteTemplate: (id: string) => Promise<void>
    handleUseTemplate: (template: any) => void
    resetForm: () => void
    handleCancel: () => void
    discardImage: () => void
    approveImage: () => void
}

const ImageGenContext = createContext<ImageGenContextType | null>(null)

/** Builds the project context string used in prompt API calls. */
function buildProjectContext(project: ProjectMini | undefined): string {
    if (!project) return ''
    return `Project Name: ${project.name}. Description: ${project.description || 'None'}. Style/Tone: ${project.toneStyle || 'None'}. Notes: ${project.customPromptNotes || 'None'}`
}

export function ImageGenProvider({ children, projects }: { children: React.ReactNode, projects?: ProjectMini[] }) {
    const t = useTranslations('ImageGen')

    const [activeTab, setActiveTab] = useState<'new' | 'library' | 'image-library'>('library')

    // Prompt Form State
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('')
    const [isCustomCategory, setIsCustomCategory] = useState(false)
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [customTagInput, setCustomTagInput] = useState('')
    const [selectedProjectId, setSelectedProjectId] = useState<string>('')
    const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState(false)

    // UI Feedback State
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    // Built Prompt State
    const [positivePrompt, setPositivePrompt] = useState('')
    const [negativePrompt, setNegativePrompt] = useState('')

    // Prompt Library State
    const [savedTemplates, setSavedTemplates] = useState<PromptTemplate[]>([])
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)
    const [isSavingTemplate, setIsSavingTemplate] = useState(false)
    const [templatePage, setTemplatePage] = useState(1)
    const [templateTotalPages, setTemplateTotalPages] = useState(1)
    const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null)
    const [isDeletingId, setIsDeletingId] = useState<string | null>(null)
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

    // Image Library State
    const [savedImages, setSavedImages] = useState<any[]>([])
    const [isLoadingImages, setIsLoadingImages] = useState(false)
    const [imagePage, setImagePage] = useState(1)
    const [imageTotalPages, setImageTotalPages] = useState(1)
    const [imageDeleteConfirmId, setImageDeleteConfirmId] = useState<string | null>(null)
    const [isDeletingImageId, setIsDeletingImageId] = useState<string | null>(null)

    // Image Generation State
    const [isGeneratingImage, setIsGeneratingImage] = useState(false)
    const [generationStatus, setGenerationStatus] = useState<string | null>(null)
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
    const [generationError, setGenerationError] = useState<string | null>(null)
    const [lastJobId, setLastJobId] = useState<string | null>(null)

    // Approval tracking: kept as refs so closures (beforeunload, polling) always see latest values
    const approvedRef = useRef(false)
    const lastJobIdRef = useRef<string | null>(null)

    const hasLoadedInitialRef = useRef(false)

    // Keep the ref in sync with the latest job ID and reset approval flag for each new job
    useEffect(() => {
        if (lastJobId) {
            lastJobIdRef.current = lastJobId
            approvedRef.current = false
        }
    }, [lastJobId])

    // Delete unapproved image on page navigation (beforeunload) or provider unmount
    useEffect(() => {
        const deleteIfUnapproved = () => {
            if (lastJobIdRef.current && !approvedRef.current) {
                fetch(`/api/images/by-job?jobId=${lastJobIdRef.current}`, { method: 'DELETE', keepalive: true }).catch(() => {})
            }
        }
        window.addEventListener('beforeunload', deleteIfUnapproved)
        return () => {
            window.removeEventListener('beforeunload', deleteIfUnapproved)
            deleteIfUnapproved()
        }
    }, [])

    const loadTemplates = useCallback(async (page = 1) => {
        setIsLoadingTemplates(true)
        try {
            const res = await fetch(`/api/prompts/saved?page=${page}`)
            const data = await res.json()
            if (res.ok) {
                setSavedTemplates(data.templates || [])
                setTemplatePage(data.page || 1)
                setTemplateTotalPages(data.totalPages || 1)
                // Auto-navigate to the builder if the user has no saved prompts yet
                if (!hasLoadedInitialRef.current && (!data.templates || data.templates.length === 0)) {
                    setActiveTab('new')
                }
                hasLoadedInitialRef.current = true
            } else {
                console.error(data.error)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoadingTemplates(false)
        }
    }, [])

    const loadImages = useCallback(async (page = 1) => {
        setIsLoadingImages(true)
        try {
            const res = await fetch(`/api/images?page=${page}`)
            const data = await res.json()
            if (res.ok) {
                setSavedImages(data.images || [])
                setImagePage(data.page || 1)
                setImageTotalPages(data.totalPages || 1)
            } else {
                console.error(data.error)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoadingImages(false)
        }
    }, [])

    useEffect(() => {
        if (activeTab === 'library') {
            loadTemplates(templatePage)
        } else if (activeTab === 'image-library') {
            loadImages(imagePage)
        }
    }, [activeTab, loadTemplates, loadImages, templatePage, imagePage])

    const handleDeleteImage = async (id: string) => {
        setIsDeletingImageId(id)
        try {
            const res = await fetch(`/api/images/${id}`, { method: 'DELETE' })
            if (res.ok) {
                setSavedImages(prev => prev.filter(img => img.id !== id))
                setImageDeleteConfirmId(null)
            } else {
                throw new Error()
            }
        } catch (err: any) {
            setError(t('errDeleteImage'))
        } finally {
            setIsDeletingImageId(null)
        }
    }

    const handleGenerateSimilar = (prompt: string, negPrompt?: string) => {
        setPositivePrompt(prompt || '')
        setNegativePrompt(negPrompt || '')
        setDescription(prompt || '')
        setGeneratedImageUrl(null)
        setGenerationError(null)
        setActiveTab('new')
    }

    const pollStatus = (jobId: string, finalUrl: string) => {
        const startTime = Date.now()
        const TIMEOUT_MS = 60_000

        const interval = setInterval(async () => {
            if (Date.now() - startTime > TIMEOUT_MS) {
                clearInterval(interval)
                setGenerationError(t('errGenTimeout'))
                setIsGeneratingImage(false)
                return
            }

            try {
                const res = await fetch(`/api/ai/generate-image/status?jobId=${jobId}`)
                if (!res.ok) throw new Error()

                const data = await res.json()
                setGenerationStatus(data.status)

                if (data.status === 'COMPLETED') {
                    clearInterval(interval)
                    setGeneratedImageUrl(finalUrl)
                    setIsGeneratingImage(false)
                } else if (data.status === 'FAILED') {
                    clearInterval(interval)
                    setGenerationError(t('errGenFailed'))
                    setIsGeneratingImage(false)
                }
            } catch (err: any) {
                console.error('Polling error:', err)
                clearInterval(interval)
                setGenerationError(t('errGenFailed'))
                setIsGeneratingImage(false)
            }
        }, 2000)
    }

    const handleGenerateImage = async () => {
        if (!description) {
            setGenerationError(t('errDescriptionRequired'))
            return
        }

        try {
            setIsGeneratingImage(true)
            setGenerationStatus(t('statusOptimizing'))
            setGenerationError(null)
            setGeneratedImageUrl(null)
            setLastJobId(null)

            const selectedProject = projects?.find(p => p.id === selectedProjectId)
            const finalContext = buildProjectContext(selectedProject)

            // 1. Build an AI-optimized prompt from the plain description
            const buildRes = await fetch('/api/prompts/build', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description, context: finalContext, category, tags: selectedTags })
            })

            const buildData = await buildRes.json()
            if (!buildRes.ok) throw new Error('errOptimizePrompt')

            const builtPos = buildData.positivePrompt || ''
            const builtNeg = buildData.negativePrompt || ''
            setPositivePrompt(builtPos)
            setNegativePrompt(builtNeg)

            // 2. Start the generation job
            setGenerationStatus(t('statusStarting'))
            const res = await fetch('/api/ai/generate-image/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description,
                    context: finalContext,
                    category,
                    tags: selectedTags,
                    projectId: selectedProjectId || undefined,
                    positivePrompt: builtPos,
                    negativePrompt: builtNeg
                })
            })

            if (!res.ok) {
                throw new Error('errStartGen')
            }

            const { jobId, imageUrl: predictedUrl } = await res.json()
            setLastJobId(jobId)
            setGenerationStatus(t('statusInProgress'))
            pollStatus(jobId, predictedUrl)

        } catch (err: any) {
            setGenerationError(err.message === 'errOptimizePrompt' ? t('errOptimizePrompt') : t('errStartGen'))
            setIsGeneratingImage(false)
            setGenerationStatus(null)
        }
    }

    const handleRegenerate = async () => {
        // Discard the previous unapproved image before starting a new generation
        discardImage()
        handleGenerateImage()
    }

    const handleSaveTemplate = async () => {
        if (!description) return

        setIsSavingTemplate(true)
        try {
            let posToSave = positivePrompt
            let negToSave = negativePrompt

            const selectedProject = projects?.find(p => p.id === selectedProjectId)

            // Build the prompt on-the-fly if the user hasn't generated an image yet
            if (!posToSave) {
                const finalContext = buildProjectContext(selectedProject)
                const buildRes = await fetch('/api/prompts/build', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ description, context: finalContext, category, tags: selectedTags })
                })
                const buildData = await buildRes.json()
                if (buildRes.ok) {
                    posToSave = buildData.positivePrompt || ''
                    negToSave = buildData.negativePrompt || ''
                    setPositivePrompt(posToSave)
                    setNegativePrompt(negToSave)
                }
            }

            const finalTemplateName = selectedProject
                ? selectedProject.name
                : `${t('defaultTemplateNamePrefix')} ${new Date().toLocaleDateString()}`

            const res = await fetch('/api/prompts/saved', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: finalTemplateName,
                    description,
                    category,
                    tags: selectedTags,
                    positivePrompt: posToSave,
                    negativePrompt: negToSave,
                    projectId: selectedProjectId || null,
                })
            })
            const data = await res.json()
            if (res.ok) {
                setSuccessMessage(t('saveSuccess'))
                setDescription('')
                setCategory('')
                setIsCustomCategory(false)
                setSelectedTags([])
                setCustomTagInput('')
                setPositivePrompt('')
                setNegativePrompt('')
                setActiveTab('library')
            } else {
                throw new Error()
            }
        } catch (err: any) {
            setError(t('errSavePrompt'))
        } finally {
            setIsSavingTemplate(false)
        }
    }

    const handleDeleteTemplate = async (id: string) => {
        setIsDeletingId(id)
        try {
            const res = await fetch(`/api/prompts/saved/${id}`, { method: 'DELETE' })
            if (res.ok) {
                setSavedTemplates(prev => prev.filter(t => t.id !== id))
                if (selectedTemplate?.id === id) setSelectedTemplate(null)
                setDeleteConfirmId(null)
            } else {
                throw new Error()
            }
        } catch (err: any) {
            setError(t('errDeletePrompt'))
        } finally {
            setIsDeletingId(null)
        }
    }

    /** Deletes the current unapproved image from the DB and clears generation state. */
    const discardImage = () => {
        if (lastJobIdRef.current && !approvedRef.current) {
            fetch(`/api/images/by-job?jobId=${lastJobIdRef.current}`, { method: 'DELETE', keepalive: true }).catch(() => {})
            lastJobIdRef.current = null
        }
        setGeneratedImageUrl(null)
        setLastJobId(null)
    }

    /** Marks the current image as approved so the cleanup effect does not delete it. */
    const approveImage = () => {
        approvedRef.current = true
    }

    const handleCancel = () => {
        discardImage()
        setIsGeneratingImage(false)
        setGenerationStatus(null)
        setGenerationError(null)
    }

    const handleUseTemplate = (template: any) => {
        setPositivePrompt(template.positivePrompt)
        setNegativePrompt(template.negativePrompt || '')
        setDescription(template.description || '')

        const cat = template.category || ''
        setCategory(cat)
        setIsCustomCategory(cat !== '' && !DEFAULT_CATEGORIES.includes(cat))
        setSelectedTags(template.tags || [])

        if (template.projectId) setSelectedProjectId(template.projectId)

        setActiveTab('new')
        setSelectedTemplate(null)
    }

    const resetForm = () => {
        discardImage()
        setDescription('')
        setCategory('')
        setIsCustomCategory(false)
        setSelectedTags([])
        setCustomTagInput('')
        setPositivePrompt('')
        setNegativePrompt('')
        setSuccessMessage(null)
        setError(null)
        setGenerationStatus(null)
        setGenerationError(null)
    }

    const value: ImageGenContextType = {
        activeTab,
        setActiveTab,
        projects,

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

        error,
        setError,
        successMessage,
        setSuccessMessage,

        positivePrompt,
        setPositivePrompt,
        negativePrompt,
        setNegativePrompt,

        savedTemplates,
        isLoadingTemplates,
        isSavingTemplate,
        templatePage,
        setTemplatePage,
        templateTotalPages,
        selectedTemplate,
        setSelectedTemplate,
        isDeletingId,
        deleteConfirmId,
        setDeleteConfirmId,

        savedImages,
        isLoadingImages,
        imagePage,
        setImagePage,
        imageTotalPages,
        imageDeleteConfirmId,
        setImageDeleteConfirmId,
        isDeletingImageId,

        isGeneratingImage,
        generationStatus,
        generatedImageUrl,
        generationError,

        loadTemplates,
        loadImages,
        handleDeleteImage,
        handleGenerateSimilar,
        handleGenerateImage,
        handleRegenerate,
        handleSaveTemplate,
        handleDeleteTemplate,
        handleUseTemplate,
        resetForm,
        handleCancel,
        discardImage,
        approveImage,
    }

    return (
        <ImageGenContext.Provider value={value}>
            {children}
        </ImageGenContext.Provider>
    )
}

export function useImageGen() {
    const context = useContext(ImageGenContext)
    if (!context) {
        throw new Error('useImageGen must be used within an ImageGenProvider')
    }
    return context
}
