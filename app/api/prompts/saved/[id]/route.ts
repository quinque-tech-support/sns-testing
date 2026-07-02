import { requireAuth } from '@/lib/auth.utils'
import { prisma } from '@/lib/prisma'
import { apiError, apiSuccess } from '@/lib/api.utils'

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userId = await requireAuth()
        const { id } = await params

        const template = await prisma.promptTemplate.findUnique({
            where: { id }
        })

        if (!template) return apiError('Template not found', 404)
        if (template.userId !== userId) return apiError('Unauthorized', 401)
        if (template.isSystem) return apiError('System templates cannot be deleted', 403)

        await prisma.promptTemplate.delete({ where: { id } })

        return apiSuccess({ deleted: true })
    } catch (error: any) {
        if (error?.isAuthError) return apiError("Unauthorized", 401)
        console.error('[DELETE /api/prompts/saved/[id]]', error)
        return apiError('Internal Error')
    }
}
