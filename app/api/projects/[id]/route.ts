import { parseProjectForm } from '@/lib/projects/form-validation'
import { apiError } from '@/lib/api.utils'
import { requireAuth } from '@/lib/auth.utils'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params
        const userId = await requireAuth()

        const body = await req.json()
        const redesigned = body.form === undefined ? undefined : parseProjectForm(body.form, userId, 'update')
        if (redesigned === null) return apiError('プロジェクトの入力内容を確認してください。', 400)
        if (redesigned) Object.assign(body, redesigned)
        const { 
            name, description, objective,
            ageRange, gender, location, profession,
            toneStyle, writingStyleNotes, exampleCaptions,
            postingFrequency, preferredTimeSlots, campaignDuration,
            preferredCtaTypes, wordsToAvoid, toneRestrictions,
            customPromptNotes, campaignSpecificInstructions,
            defaultHashtags, accountId
        } = body

        if (!name) return new NextResponse('Name is required', { status: 400 })

        if (accountId) {
            const account = await prisma.connectedAccount.findUnique({
                where: { id: accountId, userId },
                select: { id: true },
            })
            if (!account) return new NextResponse('Instagram account not found', { status: 400 })
        }

        const updateProject = async (tx: Pick<typeof prisma, 'project' | '$executeRaw'>) => {
        const updated = await tx.project.update({
            where: { id: params.id, userId: userId },
            data: { 
                ...(redesigned ? {imageGenInstructions: redesigned.imageGenInstructions, ...(redesigned.logo ? {logo: redesigned.logo} : {})} : {}),
                name, 
                accountId,
                description,
                objective,
                ageRange,
                gender,
                location,
                profession,
                toneStyle,
                writingStyleNotes,
                exampleCaptions,
                postingFrequency,
                preferredTimeSlots,
                campaignDuration,
                preferredCtaTypes,
                wordsToAvoid,
                toneRestrictions,
                customPromptNotes,
                campaignSpecificInstructions,
                defaultHashtags: Array.isArray(defaultHashtags) ? defaultHashtags : undefined,
            }
        })

        if (redesigned && !redesigned.logo) {
            await tx.$executeRaw`UPDATE "Project" SET "logo" = NULL WHERE "id" = ${params.id} AND "userId" = ${userId}`
            return {...updated, logo: null}
        }
        return updated
        }
        const project = redesigned ? await prisma.$transaction(tx => updateProject(tx)) : await updateProject(prisma)
        return NextResponse.json(project)
    } catch (error: any) {
        if (error?.isAuthError) return apiError("Unauthorized", 401)
        console.error('[PUT /api/projects/[id]]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params
        const userId = await requireAuth()

        await prisma.project.delete({
            where: { id: params.id, userId: userId }
        })

        return new NextResponse(null, { status: 204 })
    } catch (error: any) {
        if (error?.isAuthError) return apiError("Unauthorized", 401)
        console.error('[DELETE /api/projects/[id]]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
