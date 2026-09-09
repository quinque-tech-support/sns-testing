'use client'

import LiveProjectModal from './components/LiveProjectModal'

import React from 'react'
import { FolderKanban, Plus, Edit2, Trash2, X, AlertCircle, Target, MessageCircle, Calendar, ShieldAlert, Sparkles, Hash } from 'lucide-react'
import { useProjects, type Project } from './hooks/useProjects'
import ConfirmModal from '../../../components/ConfirmModal'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface ProjectsClientProps {
    initialProjects: Project[]
}

const PURPOSE_OPTIONS = [
    { value: 'awareness',   label: '認知度向上' },
    { value: 'engagement',  label: 'エンゲージメント' },
    { value: 'sales',       label: '販売・コンバージョン' },
    { value: 'leads',       label: 'リード獲得' },
    { value: 'community',   label: 'コミュニティ構築' },
    { value: 'branding',    label: 'ブランディング' },
    { value: 'education',   label: '教育・情報発信' },
    { value: 'recruitment', label: '採用・人材獲得' },
    { value: 'event',       label: 'イベント・キャンペーン告知' },
    { value: 'custom',      label: 'その他（カスタム）' },
]

const TONE_STYLE_OPTIONS = [
    { value: '', label: '選択してください' },
    { value: 'casual', label: 'カジュアル' },
    { value: 'professional', label: 'プロフェッショナル' },
    { value: 'witty', label: 'ウィットに富んだ' },
    { value: 'bold', label: '大胆' },
    { value: 'inspirational', label: 'インスピレーショナル' },
]

const FREQUENCY_OPTIONS = [
    { value: '', label: '選択してください' },
    { value: 'daily', label: '毎日' },
    { value: 'weekly', label: '毎週' },
    { value: 'custom', label: 'カスタム' },
]

const TONE_RESTRICTIONS_OPTIONS = [
    { value: '', label: '制限なし' },
    { value: 'no-slang', label: 'スラング禁止' },
    { value: 'formal-only', label: 'フォーマルのみ' },
    { value: 'no-emojis', label: '絵文字禁止' },
    { value: 'minimalist', label: 'ミニマリスト' },
]

const CTA_OPTIONS = [
    { value: 'Send a DM', label: 'DM送信' },
    { value: 'Link to Profile', label: 'プロフィールリンク' },
    { value: 'Leave a Comment', label: 'コメントする' },
    { value: 'Share', label: 'シェアする' },
]

export default function ProjectsClient({ initialProjects }: ProjectsClientProps) {
    const {
        projects, isModalOpen, editingProject, isSaving, error,
        openModal, closeModal, viewingProject, openViewModal, closeViewModal, handleDelete, saveRedesigned
    } = useProjects(initialProjects)

    const [projectToDelete, setProjectToDelete] = useState<string | null>(null)
    const t = useTranslations('Projects')

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
                </div>
                <button
                    onClick={() => openModal()}
                    className="px-5 py-2.5 w-full md:w-auto justify-center text-sm md:justify-start bg-indigo-600 hover:bg-indigo-700 dark:bg-gray-600 dark:hover:bg-gray-700 text-white font-bold rounded-xl transition-all flex items-center gap-2 max-w-max active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    {t('newProject')}
                </button>
            </div>

            {projects.length === 0 ? (
                <div className="bg-card border text-center py-20 border-card-border rounded-2xl shadow-sm">
                    <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-muted-text font-bold mb-2">{t('emptyTitle')}</p>
                    <p className="text-muted-text/80 text-sm">{t('emptyDesc')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((proj: Project) => (
                        <div key={proj.id} onClick={() => openViewModal(proj)} className="bg-card border border-card-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative group cursor-pointer hover:border-indigo-200">
                            <div className="flex items-center gap-2 mb-2">
                                <h2 className="text-xl font-bold text-foreground truncate pr-10">{proj.name}</h2>
                            </div>
                            <p className="text-sm text-muted-text line-clamp-2 min-h-[2.5rem] mb-3">
                                {proj.description || t('noDescription')}
                            </p>

                            <div className="flex flex-wrap gap-1.5 mb-3">
                                {proj.objective && (
                                    <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[10px] font-bold rounded-md">
                                        {PURPOSE_OPTIONS.find(o => o.value === proj.objective)?.label || proj.objective}
                                    </span>
                                )}
                                {proj.toneStyle && (
                                    <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded-md">
                                        {TONE_STYLE_OPTIONS.find(o => o.value === proj.toneStyle)?.label || proj.toneStyle}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <LiveProjectModal isOpen={isModalOpen} editingProject={editingProject}
                onClose={closeModal} onSave={saveRedesigned} saving={isSaving} error={error} />

            {viewingProject && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-card rounded-2xl p-6 md:p-8 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between mb-6 shrink-0">
                            <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                                <FolderKanban className="w-6 h-6 text-indigo-600" />
                                {viewingProject.name}
                            </h2>
                            <div className="flex items-center gap-2">
                                <button type="button" aria-label="プロジェクトを編集" onClick={() => { closeViewModal(); openModal(viewingProject); }} className="p-2 text-muted-text hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"><Edit2 className="w-4 h-4" /></button>
                                <button type="button" aria-label="プロジェクトを削除" onClick={() => { closeViewModal(); setProjectToDelete(viewingProject.id); }} className="p-2 text-muted-text hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"><Trash2 className="w-4 h-4" /></button>
                                <div className="w-px h-6 bg-gray-200 mx-1" />
                                <button type="button" onClick={closeViewModal} className="p-2 text-muted-text/80 hover:text-gray-600 hover:bg-surface dark:hover:bg-surface/80 rounded-lg transition-colors"><X className="w-5 h-5"/></button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 -mr-2 scrollbar-thin space-y-6">
                            {viewingProject.imageGenInstructions && <section><h3 className="font-bold">画像生成の指示</h3><p className="whitespace-pre-wrap">{viewingProject.imageGenInstructions}</p></section>}
                            {viewingProject.logo?.previewUrl && <section><h3 className="font-bold">ブランドロゴ</h3><img src={viewingProject.logo.previewUrl} alt="ブランドロゴ" className="w-16 h-16 object-contain" /><p>{viewingProject.logo.position} / {viewingProject.logo.size}</p></section>}
                            {viewingProject.description && (
                                <div>
                                    <h3 className="text-sm font-bold text-muted-text/80 uppercase tracking-wider mb-2">{t('projectDesc')}</h3>
                                    <p className="text-foreground/80 whitespace-pre-wrap text-sm leading-relaxed bg-surface p-4 rounded-xl border border-card-border">{viewingProject.description}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {viewingProject.objective && (
                                    <div>
                                        <h3 className="text-xs font-bold text-muted-text/80 uppercase tracking-wider mb-1">{t('purpose')}</h3>
                                        <p className="text-sm font-semibold text-foreground">{PURPOSE_OPTIONS.find(o => o.value === viewingProject.objective)?.label || viewingProject.objective}</p>
                                    </div>
                                )}
                                {viewingProject.toneStyle && (
                                    <div>
                                        <h3 className="text-xs font-bold text-muted-text/80 uppercase tracking-wider mb-1">{t('toneStyle')}</h3>
                                        <p className="text-sm font-semibold text-foreground">{TONE_STYLE_OPTIONS.find(o => o.value === viewingProject.toneStyle)?.label || viewingProject.toneStyle}</p>
                                    </div>
                                )}
                            </div>

                            {viewingProject.defaultHashtags && viewingProject.defaultHashtags.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold text-muted-text/80 uppercase tracking-wider mb-2">{t('defaultHashtags')}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {viewingProject.defaultHashtags.map((tag, i) => (
                                            <span key={i} className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg border border-indigo-100 dark:border-indigo-500/20">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(viewingProject.ageRange || viewingProject.gender || viewingProject.location || viewingProject.profession) && (
                                <div>
                                    <h3 className="text-sm font-bold text-muted-text/80 uppercase tracking-wider mb-2 border-b border-card-border pb-2">{t('targetAudience')}</h3>
                                    <div className="grid grid-cols-2 gap-4 mt-3">
                                        {viewingProject.ageRange && <div><span className="text-xs text-muted-text block mb-0.5">{t('ageRange')}</span><span className="text-sm font-semibold text-foreground">{viewingProject.ageRange}</span></div>}
                                        {viewingProject.gender && <div><span className="text-xs text-muted-text block mb-0.5">{t('gender')}</span><span className="text-sm font-semibold text-foreground">{viewingProject.gender}</span></div>}
                                        {viewingProject.location && <div><span className="text-xs text-muted-text block mb-0.5">{t('location')}</span><span className="text-sm font-semibold text-foreground">{viewingProject.location}</span></div>}
                                        {viewingProject.profession && <div><span className="text-xs text-muted-text block mb-0.5">{t('profession')}</span><span className="text-sm font-semibold text-foreground">{viewingProject.profession}</span></div>}
                                    </div>
                                </div>
                            )}

                            {(viewingProject.writingStyleNotes || viewingProject.exampleCaptions) && (
                                <div>
                                    <h3 className="text-sm font-bold text-muted-text/80 uppercase tracking-wider mb-2 border-b border-card-border pb-2">{t('brandVoice')}</h3>
                                    <div className="space-y-3 mt-3">
                                        {viewingProject.writingStyleNotes && (
                                            <div>
                                                <span className="text-xs text-muted-text block mb-0.5">{t('writingStyle')}</span>
                                                <p className="text-sm font-semibold text-foreground">{viewingProject.writingStyleNotes}</p>
                                            </div>
                                        )}
                                        {viewingProject.exampleCaptions && (
                                            <div>
                                                <span className="text-xs text-muted-text block mb-0.5">{t('exampleCaptions')}</span>
                                                <p className="text-sm text-foreground/80 bg-surface p-3 rounded-xl border border-card-border whitespace-pre-wrap leading-relaxed">{viewingProject.exampleCaptions}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {(viewingProject.postingFrequency || viewingProject.preferredTimeSlots || viewingProject.campaignDuration) && (
                                <div>
                                    <h3 className="text-sm font-bold text-muted-text/80 uppercase tracking-wider mb-2 border-b border-card-border pb-2">{t('postingPlan')}</h3>
                                    <div className="grid grid-cols-2 gap-4 mt-3">
                                        {viewingProject.postingFrequency && (
                                            <div>
                                                <span className="text-xs text-muted-text block mb-0.5">{t('postingFrequency')}</span>
                                                <span className="text-sm font-semibold text-foreground">{FREQUENCY_OPTIONS.find(o => o.value === viewingProject.postingFrequency)?.label || viewingProject.postingFrequency}</span>
                                            </div>
                                        )}
                                        {viewingProject.preferredTimeSlots && (
                                            <div>
                                                <span className="text-xs text-muted-text block mb-0.5">{t('preferredTime')}</span>
                                                <span className="text-sm font-semibold text-foreground">{viewingProject.preferredTimeSlots}</span>
                                            </div>
                                        )}
                                        {viewingProject.campaignDuration && (
                                            <div className="col-span-2">
                                                <span className="text-xs text-muted-text block mb-0.5">{t('campaignDuration')}</span>
                                                <span className="text-sm font-semibold text-foreground">{viewingProject.campaignDuration}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {(viewingProject.preferredCtaTypes || viewingProject.wordsToAvoid || viewingProject.toneRestrictions) && (
                                <div>
                                    <h3 className="text-sm font-bold text-muted-text/80 uppercase tracking-wider mb-2 border-b border-card-border pb-2">{t('ctaAndRestrictions')}</h3>
                                    <div className="space-y-3 mt-3">
                                        {viewingProject.preferredCtaTypes && (
                                            <div>
                                                <span className="text-xs text-muted-text block mb-0.5">{t('preferredCta')}</span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {viewingProject.preferredCtaTypes.split(',').map(c => c.trim()).filter(Boolean).map((c, i) => (
                                                        <span key={i} className="px-2.5 py-1 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-bold rounded-lg border border-green-100 dark:border-green-500/20">{CTA_OPTIONS.find(opt => opt.value === c)?.label || c}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {viewingProject.wordsToAvoid && (
                                            <div>
                                                <span className="text-xs text-muted-text block mb-0.5">{t('wordsToAvoid')}</span>
                                                <p className="text-sm font-semibold text-red-700 dark:text-red-400">{viewingProject.wordsToAvoid}</p>
                                            </div>
                                        )}
                                        {viewingProject.toneRestrictions && (
                                            <div>
                                                <span className="text-xs text-muted-text block mb-0.5">{t('toneRestrictions')}</span>
                                                <p className="text-sm font-semibold text-foreground">{TONE_RESTRICTIONS_OPTIONS.find(o => o.value === viewingProject.toneRestrictions)?.label || viewingProject.toneRestrictions}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {(viewingProject.customPromptNotes || viewingProject.campaignSpecificInstructions) && (
                                <div>
                                    <h3 className="text-sm font-bold text-muted-text/80 uppercase tracking-wider mb-2 border-b border-card-border pb-2">{t('additionalInstructions')}</h3>
                                    <div className="space-y-3 mt-3">
                                        {viewingProject.customPromptNotes && (
                                            <div>
                                                <span className="text-xs text-muted-text block mb-0.5">{t('customPrompt')}</span>
                                                <p className="text-sm text-foreground/80 bg-surface p-3 rounded-xl border border-card-border whitespace-pre-wrap leading-relaxed">{viewingProject.customPromptNotes}</p>
                                            </div>
                                        )}
                                        {viewingProject.campaignSpecificInstructions && (
                                            <div>
                                                <span className="text-xs text-muted-text block mb-0.5">{t('campaignSpecific')}</span>
                                                <p className="text-sm text-foreground/80 bg-surface p-3 rounded-xl border border-card-border whitespace-pre-wrap leading-relaxed">{viewingProject.campaignSpecificInstructions}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={!!projectToDelete}
                title={t('deleteTitle')}
                message={t('deleteConfirm')}
                confirmText={t('deleteBtn')}
                onCancel={() => setProjectToDelete(null)}
                onConfirm={() => {
                    if (projectToDelete) {
                        handleDelete(projectToDelete)
                        setProjectToDelete(null)
                    }
                }}
            />
        </div>
    )
}
