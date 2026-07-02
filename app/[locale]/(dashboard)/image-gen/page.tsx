import { requirePageAuth } from '@/lib/auth.utils'
import { prisma } from '@/lib/prisma'
import ImageGenClient from './ImageGenClient'

export default async function ImageGenPage() {
    const session = await requirePageAuth();
    const userId = session.user.id

    const projects = await prisma.project.findMany({
        where: { userId },
        select: {
            id: true,
            name: true,
            description: true,
            customPromptNotes: true,
            toneStyle: true,
        },
        orderBy: { createdAt: 'desc' }
    })

    return <ImageGenClient projects={projects} />
}
