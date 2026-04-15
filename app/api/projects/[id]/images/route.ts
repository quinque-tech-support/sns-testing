import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

type RouteProps = { params: Promise<{ id: string }> }

/** GET /api/projects/[id]/images
 *  Returns all unused ProjectImage rows for this project (newest first).
 */
export async function GET(_req: Request, { params }: RouteProps) {
    try {
        const { id: projectId } = await params
        const session = await auth()
        if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 })

        // Verify the project belongs to this user
        const project = await prisma.project.findUnique({
            where: { id: projectId, userId: session.user.id },
            select: { id: true }
        })
        if (!project) return new NextResponse('Not Found', { status: 404 })

        const images = await prisma.projectImage.findMany({
            where: { projectId, userId: session.user.id },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json(images)
    } catch (error) {
        console.error('[GET /api/projects/[id]/images]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

/** POST /api/projects/[id]/images
 *  Body: { images: { url: string; storagePath: string; fileName: string }[] }
 *  Bulk-inserts ProjectImage rows after the client has uploaded files.
 */
export async function POST(req: Request, { params }: RouteProps) {
    try {
        const { id: projectId } = await params
        const session = await auth()
        if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 })

        // Verify ownership
        const project = await prisma.project.findUnique({
            where: { id: projectId, userId: session.user.id },
            select: { id: true }
        })
        if (!project) return new NextResponse('Not Found', { status: 404 })

        const body = await req.json()
        const images: { url: string; storagePath: string; fileName: string }[] = body.images ?? []

        if (!Array.isArray(images) || images.length === 0) {
            return new NextResponse('images array is required', { status: 400 })
        }

        const created = await prisma.projectImage.createMany({
            data: images.map(img => ({
                projectId,
                userId: session.user.id,
                url: img.url,
                storagePath: img.storagePath,
                fileName: img.fileName,
            }))
        })

        return NextResponse.json({ count: created.count })
    } catch (error) {
        console.error('[POST /api/projects/[id]/images]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
