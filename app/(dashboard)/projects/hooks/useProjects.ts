import { useState } from 'react'
import { useRouter } from 'next/navigation'

export interface Project {
    id: string
    name: string
    description?: string | null
    keywords?: string | null
    defaultHashtags: string[]
}

export function useProjects(initialProjects: Project[]) {
    const router = useRouter()
    const [projects, setProjects] = useState<Project[]>(initialProjects)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingProject, setEditingProject] = useState<Project | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState('')

    // Form fields
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [keywords, setKeywords] = useState('')
    const [hashtags, setHashtags] = useState('')

    const openModal = (proj?: Project) => {
        setError('')
        if (proj) {
            setEditingProject(proj)
            setName(proj.name)
            setDescription(proj.description || '')
            setKeywords(proj.keywords || '')
            setHashtags(proj.defaultHashtags?.join(' ') || '')
        } else {
            setEditingProject(null)
            setName('')
            setDescription('')
            setKeywords('')
            setHashtags('')
        }
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsSaving(true)

        // Parse hashtags (split by space or comma, add # if missing)
        const parsedTags = hashtags
            .split(/[\s,]+/)
            .map(t => t.trim())
            .filter(t => t.length > 0)
            .map(t => t.startsWith('#') ? t : `#${t}`)

        try {
            const url = editingProject ? `/api/projects/${editingProject.id}` : '/api/projects'
            const method = editingProject ? 'PUT' : 'POST'
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, keywords, defaultHashtags: parsedTags })
            })

            if (!res.ok) throw new Error('プロジェクトの保存に失敗しました。')
            const savedProject = await res.json()

            if (editingProject) {
                setProjects(projects.map(p => p.id === savedProject.id ? savedProject : p))
            } else {
                setProjects([savedProject, ...projects])
            }
            closeModal()
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm('このプロジェクトを削除しますか？\n関連付けられたデータも削除される可能性があります。')) return

        try {
            const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('削除に失敗しました。')
            setProjects(projects.filter(p => p.id !== id))
            router.refresh()
        } catch (err: any) {
            alert(err.message)
        }
    }

    return {
        projects,
        isModalOpen,
        editingProject,
        isSaving,
        error,
        name, setName,
        description, setDescription,
        keywords, setKeywords,
        hashtags, setHashtags,
        openModal,
        closeModal,
        handleSave,
        handleDelete
    }
}
