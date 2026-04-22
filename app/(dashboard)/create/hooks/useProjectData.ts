'use client'

import { useState, useEffect } from 'react'
import { Project, HistoryItem, ProjectImage } from '../types'
import { createClient } from '@supabase/supabase-js'
import { getProjectImageUploadUrl, registerProjectImages } from '../actions'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function useProjectData() {
    // Projects
    const [projects, setProjects] = useState<Project[]>([])
    const [selectedProjectId, setSelectedProjectId] = useState<string>('')
    const [isProjectsLoading, setIsProjectsLoading] = useState(true)

    // History & Drafts
    const [history, setHistory] = useState<HistoryItem[]>([])
    const [isLoadingHistory, setIsLoadingHistory] = useState(false)
    const [drafts, setDrafts] = useState<HistoryItem[]>([])
    const [isLoadingDrafts, setIsLoadingDrafts] = useState(false)

    // Image Library
    const [projectImages, setProjectImages] = useState<ProjectImage[]>([])
    const [isLoadingProjectImages, setIsLoadingProjectImages] = useState(false)
    const [isLibraryExpanded, setIsLibraryExpanded] = useState(false)
    const [isLibraryUploading, setIsLibraryUploading] = useState(false)
    const [libraryUploadProgress, setLibraryUploadProgress] = useState(0)

    // Fetch projects on mount
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await fetch('/api/projects')
                if (res.ok) {
                    const data = await res.json()
                    setProjects(data)
                    if (data.length > 0 && !selectedProjectId) {
                        setSelectedProjectId(data[0].id)
                    }
                }
            } finally {
                setIsProjectsLoading(false)
            }
        }
        fetchProjects()
    }, [])

    // Fetch project-scoped data whenever project changes
    useEffect(() => {
        if (!selectedProjectId) {
            setHistory([])
            setDrafts([])
            setProjectImages([])
            setIsLibraryExpanded(false)
            return
        }

        const fetchHistory = async () => {
            setIsLoadingHistory(true)
            try {
                const res = await fetch(`/api/projects/${selectedProjectId}/history`)
                if (res.ok) {
                    const data = await res.json()
                    setHistory(data.history || [])
                }
            } finally {
                setIsLoadingHistory(false)
            }
        }

        const fetchDrafts = async () => {
            setIsLoadingDrafts(true)
            try {
                const res = await fetch(`/api/projects/${selectedProjectId}/drafts`)
                if (res.ok) {
                    const data = await res.json()
                    setDrafts(data.drafts || [])
                }
            } finally {
                setIsLoadingDrafts(false)
            }
        }

        const fetchLibrary = async () => {
            setIsLoadingProjectImages(true)
            try {
                const res = await fetch(`/api/projects/${selectedProjectId}/images`)
                if (res.ok) {
                    const data = await res.json()
                    setProjectImages(data)
                }
            } finally {
                setIsLoadingProjectImages(false)
            }
        }

        fetchHistory()
        fetchDrafts()
        fetchLibrary()
    }, [selectedProjectId])

    /** Upload files to the project image library via signed URLs */
    const handleLibraryUpload = async (files: File[]) => {
        if (files.length === 0 || !selectedProjectId) return
        setIsLibraryUploading(true)
        setLibraryUploadProgress(0)

        try {
            const uploadedUrls: { url: string; storagePath: string; fileName: string }[] = []

            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                const { token, path, storagePath, publicUrl, error: urlError } =
                    await getProjectImageUploadUrl(selectedProjectId, file.name)

                if (urlError || !token || !path || !storagePath || !publicUrl) {
                    console.error('[useProjectData] Failed to get signed URL for:', file.name)
                    continue
                }

                const { error: uploadError } = await supabase.storage
                    .from('media-uploads')
                    .uploadToSignedUrl(path, token, file, { cacheControl: '3600', upsert: false })

                if (!uploadError) {
                    uploadedUrls.push({ url: publicUrl, storagePath, fileName: file.name })
                }

                setLibraryUploadProgress(Math.round(((i + 1) / files.length) * 100))
            }

            if (uploadedUrls.length > 0) {
                const res = await registerProjectImages(selectedProjectId, uploadedUrls)
                if (res.count) {
                    // Refresh the library after successful upload
                    const refreshRes = await fetch(`/api/projects/${selectedProjectId}/images`)
                    if (refreshRes.ok) {
                        setProjectImages(await refreshRes.json())
                    }
                } else {
                    console.error('[useProjectData] registerProjectImages failed:', res.error)
                }
            }
        } catch (e) {
            console.error('[useProjectData] Library upload error:', e)
        } finally {
            setIsLibraryUploading(false)
            setLibraryUploadProgress(0)
            setIsLibraryExpanded(true)
        }
    }

    /** Delete an image from the project library */
    const deleteProjectImage = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm('ライブラリからこの画像を削除しますか？')) return
        try {
            const res = await fetch(`/api/projects/${selectedProjectId}/images/${id}`, { method: 'DELETE' })
            if (res.ok) {
                setProjectImages(prev => prev.filter(img => img.id !== id))
            }
        } catch (err) {
            console.error('[useProjectData] Delete image failed:', err)
        }
    }

    /** Get the currently selected project */
    const selectedProject = projects.find(p => p.id === selectedProjectId) ?? null

    return {
        projects,
        selectedProjectId,
        setSelectedProjectId,
        selectedProject,
        isProjectsLoading,
        history,
        isLoadingHistory,
        drafts,
        isLoadingDrafts,
        projectImages,
        isLoadingProjectImages,
        isLibraryExpanded,
        setIsLibraryExpanded,
        isLibraryUploading,
        libraryUploadProgress,
        handleLibraryUpload,
        deleteProjectImage
    }
}
