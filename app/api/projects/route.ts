import { requireAuth } from '@/lib/auth.utils'
import { prisma } from '@/lib/prisma'
import { apiError, apiSuccess } from '@/lib/api.utils'
export async function GET(req: Request) {
    try {
        const userId = await requireAuth()

        const { searchParams } = new URL(req.url)
        const accountId = searchParams.get('accountId')

        const whereClause: any = { userId: userId }
        if (accountId) {
            whereClause.accountId = accountId
        }

        let projects = await prisma.project.findMany({
            where: whereClause,
            orderBy: { updatedAt: 'desc' }
        })

        // Check for General project globally for the user
        const generalProjectExists = await prisma.project.findFirst({
            where: { userId: userId, name: 'General' }
        });

        if (!generalProjectExists) {
            const generalProject = await prisma.project.create({
                data: {
                    userId,
                    accountId: accountId || undefined,
                    name: 'General',
                    description: 'Default project for storing AI generated images',
                    objective: 'custom'
                }
            })
            // If they are fetching for the current accountId (or no accountId), we should include the new general project
            if (!accountId || accountId === generalProject.accountId) {
                projects = [generalProject, ...projects]
            }
        } else if (!projects.find(p => p.id === generalProjectExists.id)) {
             // If general project exists but wasn't in the fetched results (e.g., different accountId filter), we might still want to include it since it's a global library?
             // Actually, the prompt says "just to store AI generated images in library. when user selects general project they can see all AI generated images."
             // It's probably better to always return the general project so it's always accessible.
             projects = [generalProjectExists, ...projects]
        }

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
        const { 
            name, description, objective, accountId,
            ageRange, gender, location, profession,
            toneStyle, writingStyleNotes, exampleCaptions,
            postingFrequency, preferredTimeSlots, campaignDuration,
            preferredCtaTypes, wordsToAvoid, toneRestrictions,
            customPromptNotes, campaignSpecificInstructions,
            defaultHashtags
        } = body
        
        if (!name) return apiError('Name is required', 400)

        if (accountId) {
            const account = await prisma.connectedAccount.findUnique({
                where: { id: accountId, userId },
                select: { id: true },
            })
            if (!account) return apiError('Instagram account not found', 400)
        }

        const project = await prisma.project.create({
            data: {
                userId,
                accountId,
                name,
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
                defaultHashtags: Array.isArray(defaultHashtags) ? defaultHashtags : [],
            }
        })

        return apiSuccess(project)
    } catch (error: any) {
        if (error?.isAuthError) return apiError("Unauthorized", 401)
        console.error('[POST /api/projects]', error)
        return apiError('Internal Error')
    }
}
