import { z } from 'zod'
import { validateAgeRange } from './form-model'

const logoSchema = z.object({
    previewUrl: z.string().url(), fileName: z.string().min(1).max(255),
    position: z.enum(['top-left', 'top-right', 'bottom-left', 'bottom-right']),
    size: z.enum(['small', 'medium', 'large']),
})
export const projectFormSchema = z.object({
    name: z.string().trim().min(1).max(200), purpose: z.string().max(200),
    description: z.string().max(10000), hashtags: z.array(z.string().max(100)).max(50),
    minAge: z.number().nullable(), maxAge: z.number().nullable(),
    preserveAgeRange: z.boolean().optional(), preserveGender: z.boolean().optional(),
    gender: z.enum(['any', 'female', 'male', 'other']), cityRegion: z.string().max(100),
    professions: z.array(z.string().trim().min(1).max(50)).max(10),
    imageGenInstructions: z.string().max(10000), logo: logoSchema.nullable(),
    wordsToAvoid: z.string().max(5000), customPromptInstructions: z.string().max(10000),
}).refine(value => value.preserveAgeRange || !validateAgeRange(value.minAge, value.maxAge), {path: ['maxAge'], message: '開始年齢は終了年齢より小さくしてください。'})

export function parseProjectForm(input: unknown, userId: string, mode: 'create' | 'update' = 'create') {
    const parsed = projectFormSchema.safeParse(input)
    if (!parsed.success) return null
    const form = parsed.data
    if (mode === 'create' && (form.preserveAgeRange || form.preserveGender)) return null
    if (form.logo) {
        const prefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media-uploads/${userId}/logos/`
        if (!form.logo.previewUrl.startsWith(prefix)) return null
        const suffix = form.logo.previewUrl.slice(prefix.length)
        if (!/^[a-f0-9-]+\.(png|jpeg|webp)$/.test(suffix)) return null
    }
    return {
        name: form.name, objective: form.purpose, description: form.description,
        defaultHashtags: form.hashtags, ageRange: form.preserveAgeRange ? undefined : `${form.minAge}-${form.maxAge}`,
        gender: form.preserveGender ? undefined : form.gender === 'any' ? '' : form.gender, location: form.cityRegion,
        profession: form.professions.join(', '), wordsToAvoid: form.wordsToAvoid,
        customPromptNotes: form.customPromptInstructions,
        imageGenInstructions: form.imageGenInstructions, logo: form.logo,
    }
}
