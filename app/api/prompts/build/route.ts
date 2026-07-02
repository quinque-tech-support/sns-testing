import { requireAuth } from '@/lib/auth.utils'
import { apiError, apiSuccess } from '@/lib/api.utils'
import { buildImagePrompt } from '@/lib/ai/vision/promptBuilder'
import { rateLimit } from '@/lib/redis'
import { z } from 'zod'

const buildPromptSchema = z.object({
    description: z.string().min(1, 'Description is required').max(2000, 'Description is too long'),
    context: z.string().max(3000).optional(),
    category: z.string().max(100).optional(),
    tags: z.array(z.string().max(50)).max(30).default([]),
})

export async function POST(req: Request) {
    const userId = await requireAuth().catch(() => null)
    if (!userId) return apiError('Unauthorized', 401)

    // Rate limit: max 10 prompt builds per minute per user
    const isAllowed = await rateLimit(`prompt_build:${userId}`, 10, 60)
    if (!isAllowed) {
        return apiError('Rate limit exceeded. Please try again in a minute.', 429)
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return apiError('Gemini API key is not configured', 500)

    const body = await req.json().catch(() => null)
    if (!body) return apiError('Invalid JSON body', 400)

    const parseResult = buildPromptSchema.safeParse(body)
    if (!parseResult.success) {
        return apiError(parseResult.error.issues[0].message, 400)
    }

    const { description, context, category, tags } = parseResult.data

    try {
        const result = await buildImagePrompt({
            description,
            context,
            category,
            tags
        }, apiKey)

        return apiSuccess({
            positivePrompt: result.positivePrompt,
            negativePrompt: result.negativePrompt,
        })
    } catch (aiError: any) {
        console.warn('[PromptBuilder] Fallback triggered — Gemini failed, using raw description.', {
            userId,
            error: aiError.message,
            description: description.slice(0, 100) // truncated to avoid logging full user input
        })

        // Fallback to raw description so the UI still has something usable.
        // We do NOT return the raw aiError.message to the client to avoid leaking API details.
        return apiSuccess({
            positivePrompt: description,
            negativePrompt: 'text, watermark, ugly, blurry',
            fallback: true,
            error: 'AI Generation Failed. A basic prompt was provided as fallback.'
        })
    }
}
