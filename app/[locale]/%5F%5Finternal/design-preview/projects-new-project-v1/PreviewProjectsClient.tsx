'use client'

import { useState } from 'react'
import { Edit2, FlaskConical, FolderKanban, Plus, Trash2, X } from 'lucide-react'
import NewProjectModal from './components/NewProjectModal'
import ConfirmModal from '@/app/components/ConfirmModal'
import {
    INITIAL_MOCK_PROJECTS,
    GENDER_OPTIONS,
    LOGO_POSITIONS,
    LOGO_SIZES,
    PURPOSE_OPTIONS,
    type MockProject,
} from './mockData'

export default function PreviewProjectsClient() {
    const [projects, setProjects] = useState<MockProject[]>(INITIAL_MOCK_PROJECTS)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingProject, setEditingProject] = useState<MockProject | null>(null)
    const [viewingProject, setViewingProject] = useState<MockProject | null>(null)
    const [projectToDelete, setProjectToDelete] = useState<string | null>(null)
    const [toast, setToast] = useState('')

    const showToast = (message: string) => {
        setToast(message)
        setTimeout(() => setToast(''), 2200)
    }

    const openCreateModal = () => { setEditingProject(null); setIsModalOpen(true) }
    const openEditModal = (proj: MockProject) => { setEditingProject(proj); setIsModalOpen(true) }
    const closeModal = () => setIsModalOpen(false)

    const handleSaveProject = (project: MockProject) => {
        setProjects(prev => {
            const exists = prev.some(p => p.id === project.id)
            return exists ? prev.map(p => (p.id === project.id ? project : p)) : [project, ...prev]
        })
        setIsModalOpen(false)
        showToast(editingProject ? 'プロジェクトを更新しました（プレビューのみ）' : 'プロジェクトを作成しました（プレビューのみ）')
    }

    const handleDelete = (id: string) => {
        setProjects(prev => prev.filter(p => p.id !== id))
        setProjectToDelete(null)
        showToast('プロジェクトを削除しました（プレビューのみ）')
    }

    return (
        <div className="max-w-7xl mx-auto py-6 px-4 md:px-8 space-y-8">
            {/* Design-preview banner — makes the isolation boundary unmistakable */}
            <div className="rounded-2xl border border-dashed border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 text-sm font-bold">
                    <FlaskConical className="w-4 h-4 shrink-0" />
                    <span>デザインプレビュー — モックデータのみ使用。ログイン不要、本番環境への読み書きは一切行われません。変更は保存されません。</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={() => { setProjects([]); showToast('クリアしました — 空の状態を表示中') }}
                        className="px-3 py-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 bg-white/60 dark:bg-black/20 hover:bg-white rounded-lg border border-amber-200 dark:border-amber-500/30 transition-colors"
                    >
                        空の状態を表示
                    </button>
                    <button
                        onClick={() => { setProjects(INITIAL_MOCK_PROJECTS); showToast('デモデータを復元しました') }}
                        className="px-3 py-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 bg-white/60 dark:bg-black/20 hover:bg-white rounded-lg border border-amber-200 dark:border-amber-500/30 transition-colors"
                    >
                        デモデータをリセット
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">プロジェクト</h1>
                    <p className="text-sm text-muted-text mt-1">{projects.length}件のプロジェクト</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="px-5 py-2.5 w-full md:w-auto justify-center text-sm md:justify-start bg-indigo-600 hover:bg-indigo-700 dark:bg-gray-600 dark:hover:bg-gray-700 text-white font-bold rounded-xl transition-all flex items-center gap-2 max-w-max active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    新しいプロジェクト
                </button>
            </div>

            {projects.length === 0 ? (
                <div className="bg-card border text-center py-20 border-card-border rounded-2xl shadow-sm">
                    <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-muted-text font-bold mb-2">プロジェクトがありません</p>
                    <p className="text-muted-text/80 text-sm">上の「新しいプロジェクト」をクリックして最初のプロジェクトを作成しましょう。</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map(proj => (
                        <div
                            key={proj.id}
                            onClick={() => setViewingProject(proj)}
                            className="bg-card border border-card-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative group cursor-pointer hover:border-indigo-200"
                        >
                            {proj.logo && (
                                <img src={proj.logo.previewUrl} alt="" className="absolute top-6 right-6 w-8 h-8 object-contain rounded bg-white border border-card-border p-0.5" />
                            )}
                            <h2 className="text-xl font-bold text-foreground truncate pr-10 mb-2">{proj.name}</h2>
                            <p className="text-sm text-muted-text line-clamp-2 min-h-[2.5rem] mb-3">
                                {proj.description || '説明なし'}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {proj.purpose && (
                                    <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[10px] font-bold rounded-md">
                                        {PURPOSE_OPTIONS.find(o => o.value === proj.purpose)?.label || proj.purpose}
                                    </span>
                                )}
                                {proj.logo && (
                                    <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 text-[10px] font-bold rounded-md">
                                        ロゴ設定済み
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <NewProjectModal
                isOpen={isModalOpen}
                editingProject={editingProject}
                onClose={closeModal}
                onSave={handleSaveProject}
            />

            {viewingProject && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setViewingProject(null)}>
                    <div
                        role="dialog"
                        aria-modal="true"
                        onClick={e => e.stopPropagation()}
                        className="bg-card rounded-2xl p-6 md:p-8 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        <div className="flex items-center justify-between mb-6 shrink-0">
                            <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                                <FolderKanban className="w-6 h-6 text-indigo-600" />
                                {viewingProject.name}
                            </h2>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => { setViewingProject(null); openEditModal(viewingProject) }}
                                    aria-label="プロジェクトを編集"
                                    className="p-2 text-muted-text hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setViewingProject(null); setProjectToDelete(viewingProject.id) }}
                                    aria-label="プロジェクトを削除"
                                    className="p-2 text-muted-text hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <div className="w-px h-6 bg-gray-200 mx-1" />
                                <button type="button" onClick={() => setViewingProject(null)} aria-label="閉じる" className="p-2 text-muted-text/80 hover:text-gray-600 hover:bg-surface dark:hover:bg-surface/80 rounded-lg transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 -mr-2 scrollbar-thin space-y-6">
                            {viewingProject.description && (
                                <div>
                                    <h3 className="text-sm font-bold text-muted-text/80 uppercase tracking-wider mb-2">プロジェクトの説明</h3>
                                    <p className="text-foreground/80 whitespace-pre-wrap text-sm leading-relaxed bg-surface p-4 rounded-xl border border-card-border">{viewingProject.description}</p>
                                </div>
                            )}

                            {viewingProject.purpose && (
                                <div>
                                    <h3 className="text-xs font-bold text-muted-text/80 uppercase tracking-wider mb-1">目的</h3>
                                    <p className="text-sm font-semibold text-foreground">{PURPOSE_OPTIONS.find(o => o.value === viewingProject.purpose)?.label || viewingProject.purpose}</p>
                                </div>
                            )}

                            {viewingProject.hashtags.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold text-muted-text/80 uppercase tracking-wider mb-2">デフォルトハッシュタグ</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {viewingProject.hashtags.map((tag, i) => (
                                            <span key={i} className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg border border-indigo-100 dark:border-indigo-500/20">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(() => {
                                const hasAgeRange = viewingProject.minAge !== null && viewingProject.maxAge !== null
                                // Japan is implicit/fixed for this design, so Location shows city/region only.
                                const locationText = viewingProject.cityRegion.trim()
                                const hasLocation = locationText.length > 0
                                const hasProfessions = viewingProject.professions.length > 0
                                if (!hasAgeRange && !hasLocation && !hasProfessions) return null
                                return (
                                    <div>
                                        <h3 className="text-sm font-bold text-muted-text/80 uppercase tracking-wider mb-2 border-b border-card-border pb-2">ターゲットオーディエンス</h3>
                                        <div className="grid grid-cols-2 gap-4 mt-3">
                                            {hasAgeRange && (
                                                <div>
                                                    <span className="text-xs text-muted-text block mb-0.5">年齢層</span>
                                                    <span className="text-sm font-semibold text-foreground">{viewingProject.minAge}–{viewingProject.maxAge}</span>
                                                </div>
                                            )}
                                            <div>
                                                <span className="text-xs text-muted-text block mb-0.5">性別</span>
                                                <span className="text-sm font-semibold text-foreground">{GENDER_OPTIONS.find(g => g.value === viewingProject.gender)?.label ?? viewingProject.gender}</span>
                                            </div>
                                            {hasLocation && (
                                                <div>
                                                    <span className="text-xs text-muted-text block mb-0.5">所在地</span>
                                                    <span className="text-sm font-semibold text-foreground">{locationText}</span>
                                                </div>
                                            )}
                                            {hasProfessions && (
                                                <div className="col-span-2">
                                                    <span className="text-xs text-muted-text block mb-0.5">職業</span>
                                                    <span className="text-sm font-semibold text-foreground">{viewingProject.professions.join('、')}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })()}

                            {(viewingProject.imageGenInstructions || viewingProject.logo) && (
                                <div>
                                    <h3 className="text-sm font-bold text-muted-text/80 uppercase tracking-wider mb-2 border-b border-card-border pb-2">画像生成</h3>
                                    <div className="space-y-3 mt-3">
                                        {viewingProject.imageGenInstructions && (
                                            <p className="text-sm text-foreground/80 bg-surface p-3 rounded-xl border border-card-border whitespace-pre-wrap leading-relaxed">{viewingProject.imageGenInstructions}</p>
                                        )}
                                        {viewingProject.logo && (
                                            <div className="flex items-center gap-3 bg-surface p-3 rounded-xl border border-card-border">
                                                <img src={viewingProject.logo.previewUrl} alt="ブランドロゴ" className="w-10 h-10 object-contain rounded bg-white border border-card-border p-0.5" />
                                                <p className="text-xs text-muted-text">
                                                    位置：{LOGO_POSITIONS.find(p => p.value === viewingProject.logo!.position)?.label} ・ サイズ：{LOGO_SIZES.find(s => s.value === viewingProject.logo!.size)?.label}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {viewingProject.wordsToAvoid && (
                                <div>
                                    <h3 className="text-sm font-bold text-muted-text/80 uppercase tracking-wider mb-2 border-b border-card-border pb-2">コンテンツ制限</h3>
                                    <p className="text-sm font-semibold text-red-700 dark:text-red-400 mt-3">{viewingProject.wordsToAvoid}</p>
                                </div>
                            )}

                            {viewingProject.customPromptInstructions && (
                                <div>
                                    <h3 className="text-sm font-bold text-muted-text/80 uppercase tracking-wider mb-2 border-b border-card-border pb-2">AI設定</h3>
                                    <p className="text-sm text-foreground/80 bg-surface p-3 rounded-xl border border-card-border whitespace-pre-wrap leading-relaxed mt-3">{viewingProject.customPromptInstructions}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={!!projectToDelete}
                title="プロジェクトを削除"
                message={'このプロジェクトを削除しますか？\nプレビューのローカルデータのみに影響します。'}
                confirmText="削除"
                cancelText="キャンセル"
                onCancel={() => setProjectToDelete(null)}
                onConfirm={() => projectToDelete && handleDelete(projectToDelete)}
            />

            {toast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[120] px-4 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-2">
                    {toast}
                </div>
            )}
        </div>
    )
}
