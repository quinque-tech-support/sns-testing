import { requireAuth } from '@/lib/auth.utils'
import { prisma } from '@/lib/prisma'
import { apiError, apiSuccess, toErrorMessage } from '@/lib/api.utils'

export async function GET() {
    try {
        const userId = await requireAuth()

        const projects = await prisma.project.findMany({
            where: { userId: userId },
            orderBy: { updatedAt: 'desc' }
        })

        return apiSuccess(projects)
    } catch (error: any) {
        if (error?.isAuthError) return apiError("Unauthorized", 401)
        console.error('[GET /api/projects]', error)
        return apiError('Internal Error')
    }
}

export async function POST(req: Request) {
    try {
        const userId = await requireAuth()

        const body = await req.json()
        const { name, description, keywords, defaultHashtags } = body
        if (!name) return apiError('Name is required', 400)

        const project = await prisma.project.create({
            data: {
                userId: userId,
                name,
                description,
                keywords,
                defaultHashtags: Array.isArray(defaultHashtags) ? defaultHashtags : []
            }
        })

        return apiSuccess(project)
    } catch (error: any) {
        if (error?.isAuthError) return apiError("Unauthorized", 401)
        console.error('[POST /api/projects]', error)
        return apiError('Internal Error')
    }
}
