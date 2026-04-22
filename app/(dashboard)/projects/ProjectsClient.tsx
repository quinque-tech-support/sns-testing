'use client'

import React, { useState } from 'react'
import { FolderKanban, Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react'
import { useProjects, type Project } from './hooks/useProjects'

interface ProjectsClientProps {
    initialProjects: Project[]
}

export default function ProjectsClient({ initialProjects }: ProjectsClientProps) {
    const {
        projects, isModalOpen, editingProject, isSaving, error,
        name, setName, description, setDescription,
        keywords, setKeywords, hashtags, setHashtags,
        openModal, closeModal, handleSave, handleDelete
    } = useProjects(initialProjects)

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                        <FolderKanban className="w-8 h-8 text-indigo-500" />
                        プロジェクト管理
                    </h1>
                    <p className="text-gray-500 mt-2">コンテンツ作成の基盤となるプロジェクトとハッシュタグを管理します。</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 max-w-max"
                >
                    <Plus className="w-5 h-5" />
                    新規プロジェクト
                </button>
            </div>

            {projects.length === 0 ? (
                <div className="bg-white border text-center py-20 border-gray-200 rounded-2xl shadow-sm">
                    <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-bold mb-2">プロジェクトがありません</p>
                    <p className="text-gray-400 text-sm">新規作成ボタンから最初のプロジェクトを作成してください。</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map(proj => (
                        <div key={proj.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative group">
                            <h2 className="text-xl font-bold text-gray-900 mb-2 truncate pr-16">{proj.name}</h2>
                            <p className="text-sm text-gray-500 line-clamp-2 min-h-[2.5rem] mb-4">
                                {proj.description || '説明なし'}
                            </p>
                            
                            {proj.defaultHashtags && proj.defaultHashtags.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5 mb-4 max-h-[60px] overflow-hidden">
                                    {proj.defaultHashtags.slice(0, 5).map((tag, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-md">
                                            {tag}
                                        </span>
                                    ))}
                                    {proj.defaultHashtags.length > 5 && (
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-md">
                                            +{proj.defaultHashtags.length - 5}
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <div className="mb-4 text-xs text-gray-400">デフォルトハッシュタグなし</div>
                            )}

                            <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                                <button type="button" onClick={() => openModal(proj)} className="p-2 bg-white text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 shadow-sm transition-colors"><Edit2 className="w-4 h-4" /></button>
                                <button type="button" onClick={(e) => handleDelete(proj.id, e)} className="p-2 bg-white text-gray-400 hover:text-red-600 rounded-lg border border-gray-200 shadow-sm transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <form onSubmit={handleSave} className="bg-white rounded-2xl p-8 w-full max-w-3xl shadow-2xl animate-in zoom-in-95">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <FolderKanban className="w-5 h-5 text-indigo-600" />
                                {editingProject ? 'プロジェクトを編集' : '新規プロジェクト'}
                            </h2>
                            <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
                        </div>
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center justify-center gap-2">
                                <AlertCircle className="w-4 h-4" /> {error}
                            </div>
                        )}
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">プロジェクト名 <span className="text-red-500">*</span></label>
                                <input required type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all" placeholder="例: 夏のキャンペーン" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">説明 / 世界観</label>
                                <textarea value={description} onChange={e=>setDescription(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 min-h-[80px] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all" placeholder="AIの執筆の参考に使われます" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">キーワード</label>
                                <input type="text" value={keywords} onChange={e=>setKeywords(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all" placeholder="例: トレンド, エモい, 青色" />
                            </div>
                            <div className="pt-2 border-t border-gray-100">
                                <label className="block text-sm font-bold text-gray-700 mb-1">デフォルトハッシュタグ</label>
                                <p className="text-xs text-gray-500 mb-2">スペースで区切って入力してください。AIが自動的にキャプションに追加します。</p>
                                <textarea value={hashtags} onChange={e=>setHashtags(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 min-h-[100px] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all" placeholder="#カフェ巡り #東京カフェ #スイーツ" />
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 mt-8">
                            <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">キャンセル</button>
                            <button type="submit" disabled={isSaving} className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-md transition-all active:scale-95">
                                {isSaving ? '保存中...' : '保存'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}
