import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 })

        const projects = await prisma.project.findMany({
            where: { userId: session.user.id },
            orderBy: { updatedAt: 'desc' }
        })

        return NextResponse.json(projects)
    } catch (error) {
        console.error('[GET /api/projects]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 })

        const body = await req.json()
        const { name, description, keywords } = body

        if (!name) return new NextResponse('Name is required', { status: 400 })

        const project = await prisma.project.create({
            data: {
                userId: session.user.id,
                name,
                description,
                keywords
            }
        })

        return NextResponse.json(project)
    } catch (error) {
        console.error('[POST /api/projects]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
