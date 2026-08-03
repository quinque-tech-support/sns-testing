import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api.utils';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return apiError('Unauthorized', 401);
        }

        const generalProject = await prisma.project.findFirst({
            where: { userId: session.user.id, name: 'General' }
        });

        if (!generalProject) {
            return apiSuccess({ images: [] });
        }

        const images = await prisma.projectImage.findMany({
            where: { 
                userId: session.user.id,
                source: 'AI_GENERATED'
            },
            orderBy: { createdAt: 'desc' }
        });

        return apiSuccess({ images });
    } catch (error: any) {
        console.error('[GET /api/images/general]', error);
        return apiError('Internal Error');
    }
}
