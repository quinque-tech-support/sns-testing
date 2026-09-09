'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { LOGO_POSITIONS, LOGO_SIZES, type LogoPosition, type LogoSize } from '@/lib/projects/form-model'

interface LogoSettingsDialogProps {
    isOpen: boolean
    previewUrl: string
    initialPosition: LogoPosition
    initialSize: LogoSize
    /** true right after a fresh upload (Cancel should discard the file); false when re-opened via "Edit" (Cancel keeps the previously saved config). */
    isFirstUpload: boolean
    onCancel: () => void
    onSave: (config: { position: LogoPosition; size: LogoSize }) => void
}

const POSITION_STYLE: Record<LogoPosition, React.CSSProperties> = {
    'top-left': { top: '5%', left: '5%' },
    'top-right': { top: '5%', right: '5%' },
    'bottom-left': { bottom: '5%', left: '5%' },
    'bottom-right': { bottom: '5%', right: '5%' },
}

export default function LogoSettingsDialog({
    isOpen,
    previewUrl,
    initialPosition,
    initialSize,
    isFirstUpload,
    onCancel,
    onSave,
}: LogoSettingsDialogProps) {
    const [position, setPosition] = useState<LogoPosition>(initialPosition)
    const [size, setSize] = useState<LogoSize>(initialSize)
    const titleId = useId()
    const dialogRef = useRef<HTMLDivElement>(null)

    // Reset the draft whenever the dialog is (re)opened, so "Edit" always
    // preloads the project's current saved config, not a stale draft.
    useEffect(() => {
        if (isOpen) {
            setPosition(initialPosition)
            setSize(initialSize)
        }
    }, [isOpen, initialPosition, initialSize])

    useEffect(() => {
        if (!isOpen) return
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel()
        }
        document.addEventListener('keydown', onKeyDown)
        dialogRef.current?.focus()
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [isOpen, onCancel])

    if (!isOpen) return null

    const widthPct = LOGO_SIZES.find(s => s.value === size)?.widthPct ?? 11

    return (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in"
            onClick={onCancel}
        >
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                onClick={e => e.stopPropagation()}
                className="bg-card rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-in zoom-in-95 overflow-hidden flex flex-col max-h-[90vh] outline-none"
            >
                <div className="flex items-center justify-between mb-5 shrink-0">
                    <h2 id={titleId} className="text-lg font-bold text-foreground">ロゴ設定</h2>
                    <button
                        type="button"
                        onClick={onCancel}
                        aria-label="ロゴ設定を閉じる"
                        className="text-muted-text/80 hover:text-gray-600 p-1 rounded-lg hover:bg-surface"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-5">
                    {/* Instagram 4:5 preview canvas */}
                    <div>
                        <p className="text-sm font-bold text-foreground/80 mb-2">Instagram プレビュー</p>
                        <div className="relative aspect-[4/5] w-full max-w-[240px] mx-auto rounded-xl overflow-hidden border border-card-border shadow-sm">
                            <div className="instagram-gradient absolute inset-0" />
                            <div
                                className="absolute inset-0 opacity-25"
                                style={{
                                    backgroundImage:
                                        'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.35), transparent 45%), radial-gradient(circle at 75% 80%, rgba(0,0,0,0.25), transparent 55%)',
                                }}
                            />
                            <span className="absolute top-3 left-3 text-[10px] font-bold tracking-wider text-white/80 uppercase">
                                サンプル画像
                            </span>
                            <img
                                src={previewUrl}
                                alt="ロゴプレビュー"
                                style={{ ...POSITION_STYLE[position], width: `${widthPct}%`, height: 'auto' }}
                                className="absolute object-contain drop-shadow-lg rounded-sm bg-white/90 p-0.5"
                            />
                        </div>
                    </div>

                    {/* Position */}
                    <div>
                        <p className="text-sm font-bold text-foreground/80 mb-2">ロゴの位置</p>
                        <div className="grid grid-cols-2 gap-2">
                            {LOGO_POSITIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setPosition(opt.value)}
                                    aria-pressed={position === opt.value}
                                    className={`px-3 py-2 rounded-xl text-sm font-bold border transition-all ${
                                        position === opt.value
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                                            : 'bg-surface border-card-border text-muted-text hover:border-indigo-200'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Size */}
                    <div>
                        <p className="text-sm font-bold text-foreground/80 mb-2">ロゴサイズ</p>
                        <div className="grid grid-cols-3 gap-2">
                            {LOGO_SIZES.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setSize(opt.value)}
                                    aria-pressed={size === opt.value}
                                    className={`px-3 py-2 rounded-xl text-sm font-bold border transition-all ${
                                        size === opt.value
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                                            : 'bg-surface border-card-border text-muted-text hover:border-indigo-200'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-card-border shrink-0">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-bold text-muted-text hover:bg-surface dark:hover:bg-surface/80 rounded-xl transition-colors"
                    >
                        キャンセル
                    </button>
                    <button
                        type="button"
                        onClick={() => onSave({ position, size })}
                        className="px-6 py-2 text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 rounded-xl shadow-md transition-all active:scale-95"
                    >
                        保存
                    </button>
                </div>
                {isFirstUpload && (
                    <p className="text-[11px] text-muted-text/70 mt-2 text-center">
                        キャンセルするとアップロードしたロゴは破棄されます。
                    </p>
                )}
            </div>
        </div>
    )
}
