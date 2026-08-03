import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const jobId = searchParams.get('jobId');
        if (!jobId) return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });

        const fileName = `${jobId}.png`;
        const storagePath = `${session.user.id}/${fileName}`;

        // Attempt to remove from Supabase storage unconditionally, just in case the DB insert failed or raced
        await supabase.storage.from('project-images').remove([storagePath]);

        const image = await prisma.projectImage.findFirst({
            where: { fileName, userId: session.user.id }
        });

        if (image) {
            await prisma.projectImage.delete({ where: { id: image.id } });
        }

        // Cancel the job in Redis to prevent the background worker from uploading if it's still running
        const { Redis } = require('@upstash/redis');
        const redis = Redis.fromEnv();
        const existingJob = await redis.get(`job:${jobId}`);
        if (existingJob && (existingJob as any).userId === session.user.id) {
            await redis.set(`job:${jobId}`, { ...(existingJob as any), status: 'CANCELLED' }, { ex: 3600 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[DeleteImageByJob] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
