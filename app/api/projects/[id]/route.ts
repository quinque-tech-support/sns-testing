import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params
        const session = await auth()
        if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 })

        const body = await req.json()
        const { name, description, keywords } = body

        if (!name) return new NextResponse('Name is required', { status: 400 })

        const project = await prisma.project.update({
            where: { id: params.id, userId: session.user.id },
            data: { name, description, keywords }
        })

        return NextResponse.json(project)
    } catch (error) {
        console.error('[PUT /api/projects/[id]]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params
        const session = await auth()
        if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 })

        await prisma.project.delete({
            where: { id: params.id, userId: session.user.id }
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error('[DELETE /api/projects/[id]]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
