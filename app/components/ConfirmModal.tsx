'use client'

import { AlertCircle } from 'lucide-react'

interface ConfirmModalProps {
    isOpen: boolean
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    onConfirm: () => void
    onCancel: () => void
    isDestructive?: boolean
}

export default function ConfirmModal({
    isOpen,
    title,
    message,
    confirmText = '確認',
    cancelText = 'キャンセル',
    onConfirm,
    onCancel,
    isDestructive = true
}: ConfirmModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card border border-card-border rounded-2xl p-6 shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-full ${isDestructive ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{title}</h3>
                </div>
                
                <p className="text-muted-text mb-6 whitespace-pre-wrap">{message}</p>
                
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-surface hover:bg-surface/80 border border-card-border rounded-xl font-bold text-foreground transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-xl font-bold text-white transition-colors ${
                            isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}
