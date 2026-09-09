export type LogoPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
export type LogoSize = 'small' | 'medium' | 'large'

export interface LogoConfig {
    /** A blob: URL (URL.createObjectURL) for user uploads, or a /public path for seed demo data. Never uploaded anywhere. */
    previewUrl: string
    fileName: string
    position: LogoPosition
    size: LogoSize
    /** True only for the bundled /public demo asset — used to avoid revoking a blob: URL that doesn't exist. */
    isStaticAsset?: boolean
}

export type Gender = 'any' | 'female' | 'male' | 'other'

export interface ProjectFormData {
    id: string
    name: string
    purpose: string
    description: string
    hashtags: string[]
    minAge: number | null
    maxAge: number | null
    preserveAgeRange?: boolean
    preserveGender?: boolean
    existingTargeting?: { ageRange: string; gender: string }
    gender: Gender
    cityRegion: string
    professions: string[]
    imageGenInstructions: string
    logo: LogoConfig | null
    wordsToAvoid: string
    customPromptInstructions: string
    createdAt: string
    updatedAt: string
}

// value = stable internal enum (unaffected by locale), label = displayed Japanese text
export const PURPOSE_OPTIONS = [
    { value: 'awareness', label: '認知度向上' },
    { value: 'engagement', label: 'エンゲージメント' },
    { value: 'sales', label: '販売・コンバージョン' },
    { value: 'leads', label: 'リード獲得' },
    { value: 'community', label: 'コミュニティ構築' },
    { value: 'branding', label: 'ブランディング' },
    { value: 'education', label: '教育・コンテンツ' },
    { value: 'recruitment', label: '採用' },
    { value: 'event', label: 'イベント・キャンペーン' },
    { value: 'custom', label: 'その他（カスタム）' },
] as const

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
    { value: 'any', label: '指定なし' },
    { value: 'female', label: '女性' },
    { value: 'male', label: '男性' },
    { value: 'other', label: 'その他' },
]

/**
 * This design targets Japan only, so country is fixed/implicit rather than
 * a user-facing field. Not stored on ProjectFormData or shown anywhere in the
 * UI — kept here only as a documented constant in case a future version
 * needs to display or vary it.
 */
export const DEFAULT_COUNTRY = 'Japan'

export const MIN_AGE_BOUND = 13
export const MAX_AGE_BOUND = 99
export const MAX_AGE_DIGITS = 2
export const MAX_PROFESSIONS = 10
export const MAX_PROFESSION_LENGTH = 50
export const MAX_CITY_REGION_LENGTH = 100

/**
 * Strips everything but digits and caps length at MAX_AGE_DIGITS. Used on
 * every keystroke so a 3rd digit (or -, +, e, E, .) can never enter state,
 * not just as a submit-time check.
 */
export function sanitizeAgeDigits(raw: string): string {
    return raw.replace(/\D/g, '').slice(0, MAX_AGE_DIGITS)
}

/**
 * Validates the Age Range pair per the rules:
 * both required, both integers, 13–99 inclusive, min strictly < max.
 * Returns an empty string when valid, otherwise a concise Japanese inline error.
 */
export function validateAgeRange(minAge: number | null, maxAge: number | null): string {
    if (minAge === null || maxAge === null || !Number.isInteger(minAge) || !Number.isInteger(maxAge)) {
        return '開始年齢と終了年齢を入力してください。'
    }
    if (minAge < MIN_AGE_BOUND || minAge > MAX_AGE_BOUND || maxAge < MIN_AGE_BOUND || maxAge > MAX_AGE_BOUND) {
        return `年齢は${MIN_AGE_BOUND}〜${MAX_AGE_BOUND}の範囲で入力してください。`
    }
    if (minAge >= maxAge) {
        return '開始年齢は終了年齢より小さい値にしてください。'
    }
    return ''
}

export const LOGO_POSITIONS: { value: LogoPosition; label: string }[] = [
    { value: 'top-left', label: '左上' },
    { value: 'top-right', label: '右上' },
    { value: 'bottom-left', label: '左下' },
    { value: 'bottom-right', label: '右下' },
]

export const LOGO_SIZES: { value: LogoSize; label: string; widthPct: number }[] = [
    { value: 'small', label: '小', widthPct: 11 },
    { value: 'medium', label: '中', widthPct: 17 },
    { value: 'large', label: '大', widthPct: 23 },
]

export function genId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
    return `mock-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
