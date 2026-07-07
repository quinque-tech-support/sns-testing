import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { startGenerationJob } from '@/lib/ai/vision/imageGeneration';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { description, context, category, tags, projectId, positivePrompt, negativePrompt } = body;

        if (!description) {
            return NextResponse.json({ error: 'Description is required' }, { status: 400 });
        }

        const result = await startGenerationJob({
            userId: session.user.id,
            description,
            context,
            category,
            tags,
            projectId,
            positivePrompt,
            negativePrompt
        });

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('[GenerateImageStart] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
