import { requireAuth } from '@/lib/auth.utils'
import { prisma } from '@/lib/prisma'
import { apiError, apiSuccess } from '@/lib/api.utils'
import { z } from 'zod'

const savedPromptSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(2000).optional(),
    category: z.string().max(100).optional(),
    tags: z.array(z.string().max(50)).max(30).default([]),
    positivePrompt: z.string().min(1).max(4000),
    negativePrompt: z.string().max(4000).optional(),
    projectId: z.string().optional().nullable(),
})

export async function GET(req: Request) {
    try {
        const userId = await requireAuth()

        const templates = await prisma.promptTemplate.findMany({
            where: {
                OR: [
                    { userId: userId },
                    { isSystem: true }
                ]
            },
            include: {
                project: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { updatedAt: 'desc' }
        })

        return apiSuccess(templates)
    } catch (error: any) {
        if (error?.isAuthError) return apiError("Unauthorized", 401)
        console.error('[GET /api/prompts/saved]', error)
        return apiError('Internal Error')
    }
}

export async function POST(req: Request) {
    try {
        const userId = await requireAuth()

        const body = await req.json()
        const parseResult = savedPromptSchema.safeParse(body)
        if (!parseResult.success) {
            return apiError(parseResult.error.issues[0].message, 400)
        }

        const { name, description, category, tags, positivePrompt, negativePrompt, projectId } = parseResult.data

        let resolvedProjectId: string | null = null
        if (projectId) {
            const project = await prisma.project.findFirst({
                where: { id: projectId, userId }
            })
            if (!project) return apiError('Project not found or access denied', 404)
            resolvedProjectId = project.id
        }

        const template = await prisma.promptTemplate.create({
            data: {
                userId,
                name,
                description,
                category,
                tags: Array.isArray(tags) ? tags : [],
                positivePrompt,
                negativePrompt,
                projectId: resolvedProjectId,
            },
            include: {
                project: {
                    select: { id: true, name: true }
                }
            }
        })

        return apiSuccess(template)
    } catch (error: any) {
        if (error?.isAuthError) return apiError("Unauthorized", 401)
        console.error('[POST /api/prompts/saved]', error)
        return apiError('Internal Error')
    }
}
