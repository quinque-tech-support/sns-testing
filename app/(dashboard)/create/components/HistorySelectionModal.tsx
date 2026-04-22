'use client'

import React from 'react'
import {
    X,
    FolderPlus,
    Loader2,
    History,
    Heart,
    Video
} from 'lucide-react'
import { HistoryItem } from '../types'

interface HistorySelectionModalProps {
    show: boolean
    onClose: () => void
    selectedProjectId: string | null
    historyItems: HistoryItem[]
    isLoadingHistory: boolean
    handleSelectHistory: (hist: HistoryItem) => void
}

export function HistorySelectionModal({
    show,
    onClose,
    selectedProjectId,
    historyItems,
    isLoadingHistory,
    handleSelectHistory
}: HistorySelectionModalProps) {
    if (!show) return null

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in zoom-in-95" onClick={onClose}>
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden relative" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center leading-none">
                            <History className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-lg font-bold text-gray-900 leading-tight">過去の投稿から作成</h2>
                            <p className="text-xs text-gray-500 font-medium">エンゲージメントの高かった投稿を再利用して新しいコンテンツを作成します</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"><X className="w-5 h-5"/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {!selectedProjectId ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <FolderPlus className="w-12 h-12 text-gray-300 mb-4" />
                            <p className="text-gray-500 font-bold mb-1">プロジェクトが選択されていません</p>
                            <p className="text-gray-400 text-sm">履歴を表示するにはプロジェクトを選択してください</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {isLoadingHistory ? (
                                <div className="py-20 flex flex-col items-center justify-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                                    <p className="text-gray-500 font-medium text-sm">トップ投稿を分析中...</p>
                                </div>
                            ) : historyItems.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                    {historyItems.map((hist, idx) => (
                                        <div 
                                            key={hist.id} 
                                            onClick={() => {
                                                handleSelectHistory(hist)
                                                onClose()
                                            }}
                                            className="group relative aspect-[4/5] bg-gray-200 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl hover:ring-2 hover:ring-blue-500 hover:-translate-y-1 transition-all duration-300"
                                        >
                                            <img src={hist.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                                            
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-black/20 backdrop-blur-[2px]">
                                                <span className="bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">再利用する</span>
                                            </div>
                                            {hist.mediaType === 'VIDEO' && (
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <Video className="w-8 h-8 text-white drop-shadow-lg" />
                                                </div>
                                            )}
                                            {idx < 5 && (
                                                <div className="absolute top-2 left-2 px-2 h-6 rounded-full bg-white font-bold flex items-center justify-center text-xs shadow-sm border border-gray-100 gap-1 text-gray-700">
                                                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx+1}`}
                                                </div>
                                            )}
                                            <div className="absolute bottom-2 inset-x-2">
                                                <div className="bg-black/70 backdrop-blur-md rounded-xl p-2 border border-white/10 flex flex-col gap-1">
                                                    <div className="text-[10px] text-gray-300 font-medium tracking-wide">
                                                        {new Date(hist.createdAt).toLocaleDateString()}
                                                    </div>
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <div className="flex items-center gap-1"><Heart className="w-3 h-3 text-pink-400 fill-pink-400"/><span className="text-[10px] text-white font-bold">{hist.likes}</span></div>
                                                        <div className="flex items-center gap-1"><History className="w-3 h-3 text-blue-400"/><span className="text-[10px] text-white font-bold">{hist.reach}</span></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                                    <History className="w-12 h-12 text-gray-300 mb-4" />
                                    <p className="text-gray-500 font-bold mb-1">履歴データが見つかりません</p>
                                    <p className="text-gray-400 text-sm">システムが十分なデータポイントを収集していません</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
