 'use client'
import { useMemo } from 'react'
import NewProjectModal from '@/app/components/projects/NewProjectModal'
import type { ProjectFormData, Gender } from '@/lib/projects/form-model'
import type { Project } from '../hooks/useProjects'

export default function LiveProjectModal(props: {
    isOpen: boolean; editingProject: Project | null; onClose: () => void;
    onSave: (form: ProjectFormData) => Promise<void>; saving: boolean; error: string;
}) {
    const form = useMemo<ProjectFormData | null>(() => {
        const p = props.editingProject
        if (!p) return null
        const ages = (p.ageRange || '').match(/^(\d+)\s*[-–〜]\s*(\d+)$/)
        const genderMap: Record<string, Gender> = {female: 'female', male: 'male', other: 'other', 女性: 'female', 男性: 'male', その他: 'other'}
        return {id: p.id, name: p.name, purpose: p.objective || '', description: p.description || '',
            hashtags: p.defaultHashtags || [], minAge: ages ? Number(ages[1]) : null, maxAge: ages ? Number(ages[2]) : null,
            gender: genderMap[p.gender || ''] || 'any', cityRegion: p.location || '',
            professions: (p.profession || '').split(',').map(s => s.trim()).filter(Boolean),
            imageGenInstructions: p.imageGenInstructions || '', logo: p.logo?.previewUrl ? p.logo : null,
            wordsToAvoid: p.wordsToAvoid || '', customPromptInstructions: p.customPromptNotes || '',
            createdAt: '', updatedAt: ''}
    }, [props.editingProject])
    return <NewProjectModal {...props} editingProject={form} />
}
