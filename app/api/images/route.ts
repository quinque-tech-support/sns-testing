import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const PAGE_SIZE = 12;

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));

        const where = {
            userId: session.user.id,
            source: 'AI_GENERATED',
        };

        const [images, total] = await Promise.all([
            prisma.projectImage.findMany({
                where,
                include: {
                    project: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip: (page - 1) * PAGE_SIZE,
                take: PAGE_SIZE,
            }),
            prisma.projectImage.count({ where }),
        ]);

        return NextResponse.json({
            images,
            total,
            page,
            totalPages: Math.ceil(total / PAGE_SIZE),
        });
    } catch (error: any) {
        console.error('[GetImages] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
