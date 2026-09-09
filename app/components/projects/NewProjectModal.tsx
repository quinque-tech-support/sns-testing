'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { AlertCircle, ChevronDown, ChevronUp, FolderKanban, Hash, ImageIcon, Sparkles, Target, Upload, X } from 'lucide-react'
import LogoSettingsDialog from './LogoSettingsDialog'
import {
    genId,
    validateAgeRange,
    sanitizeAgeDigits,
    PURPOSE_OPTIONS,
    GENDER_OPTIONS,
    LOGO_POSITIONS,
    LOGO_SIZES,
    MAX_PROFESSIONS,
    MAX_PROFESSION_LENGTH,
    MAX_CITY_REGION_LENGTH,
    type Gender,
    type LogoConfig,
    type LogoPosition,
    type LogoSize,
    type ProjectFormData,
} from '@/lib/projects/form-model'

interface NewProjectModalProps {
    isOpen: boolean
    editingProject: ProjectFormData | null
    onClose: () => void
    onSave: (project: ProjectFormData) => void | Promise<void>
    saving?: boolean
    error?: string
}

const ACCEPTED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp']

export default function NewProjectModal({ isOpen, editingProject, onClose, onSave, saving = false, error = '' }: NewProjectModalProps) {
    const [name, setName] = useState('')
    const [purpose, setPurpose] = useState('')
    const [description, setDescription] = useState('')
    const [hashtagInput, setHashtagInput] = useState('')
    const [hashtags, setHashtags] = useState<string[]>([])
    const [minAge, setMinAge] = useState<number | null>(null)
    const [maxAge, setMaxAge] = useState<number | null>(null)
    const [ageEdited, setAgeEdited] = useState(false)
    const [genderEdited, setGenderEdited] = useState(false)
    const preserveAgeRange = !!editingProject?.existingTargeting && !ageEdited
    const preserveGender = !!editingProject?.existingTargeting && !genderEdited
    const [gender, setGender] = useState<Gender>('any')
    const [cityRegion, setCityRegion] = useState('')
    const [professions, setProfessions] = useState<string[]>([])
    const [professionInput, setProfessionInput] = useState('')
    const [imageGenInstructions, setImageGenInstructions] = useState('')
    const [logo, setLogo] = useState<LogoConfig | null>(null)
    const [wordsToAvoid, setWordsToAvoid] = useState('')
    const [customPromptInstructions, setCustomPromptInstructions] = useState('')

    // Image Generation is an advanced/optional section, collapsed by default.
    // This is purely a display toggle — imageGenInstructions/logo state above
    // lives in this same component and is never cleared by collapsing it.
    const [isImageGenerationOpen, setIsImageGenerationOpen] = useState(false)

    // Logo settings dialog state
    const [logoDialogOpen, setLogoDialogOpen] = useState(false)
    const [pendingLogoUrl, setPendingLogoUrl] = useState<string | null>(null)
    const [pendingLogoFileName, setPendingLogoFileName] = useState('')
    const [isFirstUpload, setIsFirstUpload] = useState(true)

    const [nameError, setNameError] = useState('')
    const [ageRangeError, setAgeRangeError] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)
    const nameInputRef = useRef<HTMLInputElement>(null)
    const minAgeInputRef = useRef<HTMLInputElement>(null)
    const dialogRef = useRef<HTMLDivElement>(null)
    const titleId = useId()

    const resetForm = () => {
        setName('')
        setPurpose('')
        setDescription('')
        setHashtagInput('')
        setHashtags([])
        setMinAge(null)
        setMaxAge(null)
        setGender('any')
        setCityRegion('')
        setProfessions([])
        setProfessionInput('')
        setImageGenInstructions('')
        setLogo(null)
        setWordsToAvoid('')
        setCustomPromptInstructions('')
        setNameError('')
        setAgeRangeError('')
        setIsImageGenerationOpen(false)
    }

    useEffect(() => {
        if (!isOpen) return
        setAgeEdited(false)
        setGenderEdited(false)
        if (editingProject) {
            setName(editingProject.name)
            setPurpose(editingProject.purpose)
            setDescription(editingProject.description)
            setHashtags(editingProject.hashtags)
            setMinAge(editingProject.minAge)
            setMaxAge(editingProject.maxAge)
            setGender(editingProject.gender)
            setCityRegion(editingProject.cityRegion)
            setProfessions(editingProject.professions)
            setProfessionInput('')
            setImageGenInstructions(editingProject.imageGenInstructions)
            setLogo(editingProject.logo)
            setWordsToAvoid(editingProject.wordsToAvoid)
            setCustomPromptInstructions(editingProject.customPromptInstructions)
            setNameError('')
            setAgeRangeError('')
            setIsImageGenerationOpen(false)
        } else {
            resetForm()
        }
        // Autofocus the first field for keyboard users.
        setTimeout(() => nameInputRef.current?.focus(), 0)
    }, [isOpen, editingProject])

    useEffect(() => {
        if (!isOpen) return
        setAgeEdited(false)
        setGenderEdited(false)
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !logoDialogOpen && !saving) onClose()
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [isOpen, logoDialogOpen, onClose, saving])

    if (!isOpen) return null

    const handleHashtagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
            e.preventDefault()
            const val = hashtagInput.trim()
            if (val) {
                const newTag = val.startsWith('#') ? val : `#${val}`
                if (!hashtags.includes(newTag)) setHashtags([...hashtags, newTag])
                setHashtagInput('')
            }
        }
    }
    const removeHashtag = (tag: string) => setHashtags(hashtags.filter(h => h !== tag))

    const addProfession = () => {
        const val = professionInput.trim().slice(0, MAX_PROFESSION_LENGTH)
        if (!val || professions.length >= MAX_PROFESSIONS) {
            setProfessionInput('')
            return
        }
        const isDuplicate = professions.some(p => p.toLowerCase() === val.toLowerCase())
        if (!isDuplicate) setProfessions([...professions, val])
        setProfessionInput('')
    }
    const handleProfessionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            addProfession()
        }
    }
    const removeProfession = (tag: string) => setProfessions(professions.filter(p => p !== tag))

    const handleFileSelect = (file: File | null) => {
        if (!file) return
        if (!ACCEPTED_LOGO_TYPES.includes(file.type) || file.size > 2 * 1024 * 1024) {
            setNameError('ロゴは2MB以下のPNG・JPEG・WebPを選択してください。'); return
        }
        const url = URL.createObjectURL(file)
        setPendingLogoUrl(url)
        setPendingLogoFileName(file.name)
        setIsFirstUpload(true)
        setLogoDialogOpen(true)
    }

    const openEditLogo = () => {
        if (!logo) return
        setPendingLogoUrl(logo.previewUrl)
        setPendingLogoFileName(logo.fileName)
        setIsFirstUpload(false)
        setLogoDialogOpen(true)
    }

    const handleLogoDialogSave = ({ position, size }: { position: LogoPosition; size: LogoSize }) => {
        if (!pendingLogoUrl) return
        // Revoke the previous blob URL if we're replacing a user-uploaded logo.
        if (logo && !logo.isStaticAsset && logo.previewUrl !== pendingLogoUrl) {
            URL.revokeObjectURL(logo.previewUrl)
        }
        setLogo({
            previewUrl: pendingLogoUrl,
            fileName: pendingLogoFileName,
            position,
            size,
            isStaticAsset: pendingLogoUrl === logo?.previewUrl ? logo?.isStaticAsset : false,
        })
        setLogoDialogOpen(false)
        setPendingLogoUrl(null)
    }

    const handleLogoDialogCancel = () => {
        if (isFirstUpload && pendingLogoUrl) {
            URL.revokeObjectURL(pendingLogoUrl)
        }
        setLogoDialogOpen(false)
        setPendingLogoUrl(null)
    }

    const handleRemoveLogo = () => {
        if (logo && !logo.isStaticAsset) URL.revokeObjectURL(logo.previewUrl)
        setLogo(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const trimmedName = name.trim()
        const ageError = preserveAgeRange ? '' : validateAgeRange(minAge, maxAge)

        let hasError = false
        if (!trimmedName) {
            setNameError('プロジェクト名を入力してください。')
            hasError = true
        } else {
            setNameError('')
        }
        if (ageError) {
            setAgeRangeError(ageError)
            hasError = true
        } else {
            setAgeRangeError('')
        }
        if (hasError) {
            // Focus whichever required field is empty/invalid, preferring the first one in tab order.
            if (!trimmedName) nameInputRef.current?.focus()
            else minAgeInputRef.current?.focus()
            return
        }

        const now = new Date().toISOString()
        const project: ProjectFormData = {
            id: editingProject?.id ?? genId(),
            name: trimmedName,
            purpose,
            description: description.trim(),
            hashtags: [...new Set([...hashtags, ...hashtagInput.split(/[\s,]+/).filter(Boolean).map(t => t.startsWith('#') ? t : `#${t}`)])],
            preserveAgeRange,
            preserveGender,
            minAge,
            maxAge,
            gender,
            cityRegion: cityRegion.trim().slice(0, MAX_CITY_REGION_LENGTH),
            professions: [...new Set([...professions, ...(professionInput.trim() ? [professionInput.trim()] : [])])].slice(0, MAX_PROFESSIONS),
            imageGenInstructions: imageGenInstructions.trim(),
            logo,
            wordsToAvoid: wordsToAvoid.trim(),
            customPromptInstructions: customPromptInstructions.trim(),
            createdAt: editingProject?.createdAt ?? now,
            updatedAt: now,
        }
        if (!saving) await onSave(project)
    }

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in" onClick={() => { if (!saving) onClose() }}>
            <form
                ref={dialogRef as any}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                onSubmit={handleSubmit}
                onClick={e => e.stopPropagation()}
                // All fields are validated in handleSubmit/validateAgeRange rather than
                // via native browser constraint validation, so error messages stay in
                // the Gravia-styled inline format instead of an unstyled native tooltip.
                noValidate
                className="bg-card rounded-2xl p-6 md:p-8 w-full max-w-3xl shadow-2xl animate-in zoom-in-95 overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="flex items-center justify-between mb-6 shrink-0">
                    <h2 id={titleId} className="text-xl font-bold flex items-center gap-2">
                        <FolderKanban className="w-5 h-5 text-foreground" />
                        {editingProject ? 'プロジェクトを編集' : '新しいプロジェクト'}
                    </h2>
                    <button type="button" onClick={() => { if (!saving) onClose() }} aria-label="閉じる" className="text-muted-text/80 hover:text-gray-600 p-1 rounded-lg hover:bg-surface">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 -mr-2 scrollbar-thin space-y-8">
                    {error && <p role="alert" className="text-red-600">{error}</p>}
                    {/* SECTION 1: Basic Information */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-foreground font-bold border-b border-card-border pb-2">
                            <FolderKanban className="w-4 h-4" />
                            <span>基本情報</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="pv-name" className="block text-sm font-bold text-foreground/80 mb-1">
                                    プロジェクト名 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="pv-name"
                                    ref={nameInputRef}
                                    type="text"
                                    value={name}
                                    onChange={e => { setName(e.target.value); if (nameError) setNameError('') }}
                                    aria-invalid={!!nameError}
                                    aria-describedby={nameError ? 'pv-name-error' : undefined}
                                    className={`w-full bg-surface border rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-900/10 outline-none transition-all ${
                                        nameError ? 'border-red-400 focus:border-red-400' : 'border-card-border focus:border-gray-400'
                                    }`}
                                    placeholder="プロジェクト名を入力"
                                />
                                {nameError && (
                                    <p id="pv-name-error" className="mt-1 text-xs font-semibold text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5" /> {nameError}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="pv-purpose" className="block text-sm font-bold text-foreground/80 mb-1">目的</label>
                                <select
                                    id="pv-purpose"
                                    value={purpose}
                                    onChange={e => setPurpose(e.target.value)}
                                    className="w-full bg-surface border border-card-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 outline-none transition-all text-sm"
                                >
                                    <option value="">目的を選択</option>
                                    {purpose && !PURPOSE_OPTIONS.some(o => o.value === purpose) && <option value={purpose}>{purpose}</option>}
                                    {PURPOSE_OPTIONS.map(o => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="pv-description" className="block text-sm font-bold text-foreground/80 mb-1">プロジェクトの説明</label>
                                <textarea
                                    id="pv-description"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="w-full bg-surface border border-card-border rounded-lg px-4 py-2 min-h-[72px] focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 outline-none transition-all"
                                    placeholder="このプロジェクトについて入力してください"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="pv-hashtags" className="block text-sm font-bold text-foreground/80 mb-1 flex items-center gap-2">
                                    <Hash className="w-4 h-4 text-muted-text/80" /> デフォルトハッシュタグ
                                </label>
                                <input
                                    id="pv-hashtags"
                                    type="text"
                                    value={hashtagInput}
                                    onChange={e => setHashtagInput(e.target.value)}
                                    onKeyDown={handleHashtagKeyDown}
                                    className="w-full bg-surface border border-card-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 outline-none transition-all"
                                    placeholder="例：#ブランド #Instagram"
                                />
                                {hashtags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {hashtags.map((tag, i) => (
                                            <span key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-sm font-bold rounded-lg border border-indigo-100 dark:border-indigo-500/20">
                                                {tag}
                                                <button type="button" onClick={() => removeHashtag(tag)} aria-label={`${tag}を削除`} className="hover:text-red-500 focus:outline-none">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: Target Audience */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-foreground font-bold border-b border-card-border pb-2">
                            <Target className="w-4 h-4" />
                            <span>ターゲットオーディエンス</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Age Range */}
                            <div>
                                <label className="block text-sm font-bold text-foreground/80 mb-1">
                                    年齢層 <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        id="pv-minage"
                                        ref={minAgeInputRef}
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        autoComplete="off"
                                        maxLength={2}
                                        value={minAge ?? ''}
                                        onChange={e => {
                                            setAgeEdited(true)
                                            const digits = sanitizeAgeDigits(e.target.value)
                                            setMinAge(digits === '' ? null : Number.parseInt(digits, 10))
                                            if (ageRangeError) setAgeRangeError('')
                                        }}
                                        aria-label="開始年齢"
                                        aria-invalid={!!ageRangeError}
                                        aria-describedby={ageRangeError ? 'pv-agerange-error' : undefined}
                                        className={`w-full min-w-0 flex-1 bg-surface border rounded-lg px-3 py-2 text-center focus:ring-2 focus:ring-gray-900/10 outline-none transition-all ${
                                            ageRangeError ? 'border-red-400 focus:border-red-400' : 'border-card-border focus:border-gray-400'
                                        }`}
                                    />
                                    <span className="text-muted-text font-bold shrink-0" aria-hidden="true">–</span>
                                    <input
                                        id="pv-maxage"
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        autoComplete="off"
                                        maxLength={2}
                                        value={maxAge ?? ''}
                                        onChange={e => {
                                            setAgeEdited(true)
                                            const digits = sanitizeAgeDigits(e.target.value)
                                            setMaxAge(digits === '' ? null : Number.parseInt(digits, 10))
                                            if (ageRangeError) setAgeRangeError('')
                                        }}
                                        aria-label="終了年齢"
                                        aria-invalid={!!ageRangeError}
                                        aria-describedby={ageRangeError ? 'pv-agerange-error' : undefined}
                                        className={`w-full min-w-0 flex-1 bg-surface border rounded-lg px-3 py-2 text-center focus:ring-2 focus:ring-gray-900/10 outline-none transition-all ${
                                            ageRangeError ? 'border-red-400 focus:border-red-400' : 'border-card-border focus:border-gray-400'
                                        }`}
                                    />
                                </div>
                                {preserveAgeRange && <p className="mt-1 text-xs text-muted-text">現在の設定: {editingProject?.existingTargeting?.ageRange || "未設定"}（年齢を変更しない場合は維持されます）</p>}
                                {ageRangeError && (
                                    <p id="pv-agerange-error" className="mt-1 text-xs font-semibold text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5" /> {ageRangeError}
                                    </p>
                                )}
                            </div>

                            {/* Gender */}
                            <div>
                                <label htmlFor="pv-gender" className="block text-sm font-bold text-foreground/80 mb-1">
                                    性別 <span className="text-muted-text/80 text-[10px] font-normal ml-1">任意</span>
                                </label>
                                <select
                                    id="pv-gender"
                                    value={preserveGender ? '__existing' : gender}
                                    onChange={e => { setGenderEdited(true); setGender(e.target.value as Gender) }}
                                    className="w-full bg-surface border border-card-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 outline-none transition-all text-sm"
                                >
                                    {preserveGender && <option value={preserveGender ? '__existing' : gender}>現在の設定: {editingProject?.existingTargeting?.gender || "未設定"}</option>}
                                    {GENDER_OPTIONS.map(o => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Location — Japan is implicit/fixed for this design; only City/Region is user-facing */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-foreground/80 mb-1">
                                    所在地 <span className="text-muted-text/80 text-[10px] font-normal ml-1">任意</span>
                                </label>
                                <label htmlFor="pv-city" className="block text-xs font-semibold text-muted-text mb-1">市区町村 / 地域</label>
                                <input
                                    id="pv-city"
                                    type="text"
                                    value={cityRegion}
                                    onChange={e => setCityRegion(e.target.value.slice(0, MAX_CITY_REGION_LENGTH))}
                                    maxLength={MAX_CITY_REGION_LENGTH}
                                    className="w-full bg-surface border border-card-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 outline-none transition-all"
                                    placeholder="例：東京"
                                />
                            </div>

                            {/* Profession — spans both columns, tag/chip input */}
                            <div className="md:col-span-2">
                                <label htmlFor="pv-profession" className="block text-sm font-bold text-foreground/80 mb-1">
                                    職業 <span className="text-muted-text/80 text-[10px] font-normal ml-1">任意</span>
                                    {professions.length > 0 && (
                                        <span className="text-muted-text/60 text-[10px] font-normal ml-2">{professions.length}/{MAX_PROFESSIONS}</span>
                                    )}
                                </label>
                                {professions.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {professions.map((tag, i) => (
                                            <span key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-sm font-bold rounded-lg border border-indigo-100 dark:border-indigo-500/20">
                                                {tag}
                                                <button type="button" onClick={() => removeProfession(tag)} aria-label={`${tag}を削除`} className="hover:text-red-500 focus:outline-none">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <input
                                    id="pv-profession"
                                    type="text"
                                    value={professionInput}
                                    onChange={e => setProfessionInput(e.target.value)}
                                    onKeyDown={handleProfessionKeyDown}
                                    disabled={professions.length >= MAX_PROFESSIONS}
                                    className="w-full bg-surface border border-card-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 outline-none transition-all disabled:opacity-50"
                                    placeholder={professions.length >= MAX_PROFESSIONS ? `上限（${MAX_PROFESSIONS}件）に達しました` : '職業を追加...'}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: Image Generation — collapsible (advanced/optional project-level settings) */}
                    <div className="space-y-4">
                        <button
                            type="button"
                            onClick={() => setIsImageGenerationOpen(o => !o)}
                            aria-expanded={isImageGenerationOpen}
                            aria-controls="pv-imagegen-panel"
                            className="w-full flex items-center justify-between gap-2 text-foreground font-bold border-b border-card-border pb-2 text-left hover:text-indigo-600 transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" />
                                <span>画像生成</span>
                            </span>
                            {isImageGenerationOpen ? (
                                <ChevronUp className="w-4 h-4 shrink-0" aria-hidden="true" />
                            ) : (
                                <ChevronDown className="w-4 h-4 shrink-0" aria-hidden="true" />
                            )}
                        </button>

                        {isImageGenerationOpen && (
                            <div id="pv-imagegen-panel" className="space-y-4 animate-in fade-in duration-150">
                                <div>
                                    <label htmlFor="pv-imagegen" className="block text-sm font-bold text-foreground/80 mb-1">画像生成の指示</label>
                                    <textarea
                                        id="pv-imagegen"
                                        value={imageGenInstructions}
                                        onChange={e => setImageGenInstructions(e.target.value)}
                                        className="w-full bg-surface border border-card-border rounded-lg px-4 py-2 min-h-[88px] focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 outline-none transition-all"
                                        placeholder={'高品質な商品写真、シンプルな背景、柔らかなスタジオ照明、\n中央配置、統一されたブランドカラーとビジュアルスタイル'}
                                    />
                                    <p className="text-xs text-muted-text/80 mt-1">このプロジェクトで生成する画像のデフォルトのビジュアルスタイルとして使用されます。</p>
                                </div>

                                <div>
                                    <p className="block text-sm font-bold text-foreground/80 mb-1">ブランドロゴ</p>
                                    {!logo ? (
                                        <div
                                            onDragOver={e => e.preventDefault()}
                                            onDrop={e => {
                                                e.preventDefault()
                                                handleFileSelect(e.dataTransfer.files?.[0] ?? null)
                                            }}
                                            className="border-2 border-dashed border-card-border rounded-xl py-8 px-4 flex flex-col items-center justify-center text-center gap-2 bg-surface/50"
                                        >
                                            <Upload className="w-8 h-8 text-muted-text/60" />
                                            <p className="text-sm font-semibold text-foreground/80">ロゴをここにドロップ</p>
                                            <p className="text-xs text-muted-text/70">または</p>
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="px-4 py-2 text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 rounded-xl shadow-md transition-all active:scale-95"
                                            >
                                                ロゴをアップロード
                                            </button>
                                            <p className="text-[11px] text-muted-text/60 mt-1">PNG / JPG / WebP</p>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/png,image/jpeg,image/webp"
                                                className="sr-only"
                                                aria-label="ロゴをアップロード"
                                                onChange={e => handleFileSelect(e.target.files?.[0] ?? null)}
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-4 p-4 bg-surface border border-card-border rounded-xl">
                                            <img src={logo.previewUrl} alt="ブランドロゴ" className="w-14 h-14 object-contain rounded-lg bg-white border border-card-border p-1 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-foreground truncate">{logo.fileName}</p>
                                                <p className="text-xs text-muted-text mt-0.5">
                                                    位置：{LOGO_POSITIONS.find(p => p.value === logo.position)?.label} ・ サイズ：{LOGO_SIZES.find(s => s.value === logo.size)?.label}
                                                </p>
                                                <div className="flex flex-wrap gap-3 mt-2">
                                                    <button type="button" onClick={openEditLogo} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">編集</button>
                                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs font-bold text-muted-text hover:text-foreground">ロゴを変更</button>
                                                    <button type="button" onClick={handleRemoveLogo} className="text-xs font-bold text-red-600 hover:text-red-700">削除</button>
                                                </div>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/png,image/jpeg,image/webp"
                                                    className="sr-only"
                                                    aria-label="ロゴを変更"
                                                    onChange={e => handleFileSelect(e.target.files?.[0] ?? null)}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SECTION 4: Content Restrictions */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-foreground font-bold border-b border-card-border pb-2">
                            <AlertCircle className="w-4 h-4" />
                            <span>コンテンツ制限</span>
                        </div>
                        <div>
                            <label htmlFor="pv-words" className="block text-sm font-bold text-foreground/80 mb-1">使用しない単語</label>
                            <input
                                id="pv-words"
                                type="text"
                                value={wordsToAvoid}
                                onChange={e => setWordsToAvoid(e.target.value)}
                                className="w-full bg-surface border border-card-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 outline-none transition-all"
                                placeholder="例：安い、絶対、スパム"
                            />
                        </div>
                    </div>

                    {/* SECTION 5: AI Settings */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-foreground font-bold border-b border-card-border pb-2">
                            <Sparkles className="w-4 h-4" />
                            <span>AI設定</span>
                        </div>
                        <div>
                            <label htmlFor="pv-prompt" className="block text-sm font-bold text-foreground/80 mb-1">カスタムAI指示</label>
                            <textarea
                                id="pv-prompt"
                                value={customPromptInstructions}
                                onChange={e => setCustomPromptInstructions(e.target.value)}
                                className="w-full bg-surface border border-card-border rounded-lg px-4 py-2 min-h-[72px] focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 outline-none transition-all"
                                placeholder="任意のトーン・振る舞いに関する指示"
                            />
                            <p className="text-xs text-muted-text/80 mt-1">このプロジェクトでAIがコンテンツを生成する際に使用する追加の指示です（画像生成の指示とは別に、キャプションなどの文章生成の挙動に使われます）。</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch justify-end gap-3 mt-8 pt-4 border-t border-card-border shrink-0">
                    <button type="button" onClick={() => { if (!saving) onClose() }} className="px-4 py-2 text-sm font-bold text-muted-text hover:bg-surface dark:hover:bg-surface/80 rounded-xl transition-colors">キャンセル</button>
                    <button disabled={saving} type="submit" className="px-6 py-2 text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 rounded-xl shadow-md transition-all active:scale-95">
                        {saving ? '保存中…' : editingProject ? '変更を保存' : 'プロジェクトを作成'}
                    </button>
                </div>
            </form>

            <LogoSettingsDialog
                isOpen={logoDialogOpen}
                previewUrl={pendingLogoUrl ?? ''}
                initialPosition={logo?.position ?? 'bottom-right'}
                initialSize={logo?.size ?? 'small'}
                isFirstUpload={isFirstUpload}
                onCancel={handleLogoDialogCancel}
                onSave={handleLogoDialogSave}
            />
        </div>
    )
}
