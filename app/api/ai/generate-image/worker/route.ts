import { NextRequest, NextResponse } from 'next/server';
import { executeGenerationWorker, failGenerationWorker } from '@/lib/ai/vision/imageGeneration';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { jobId, prompt, uploadUrl } = body;

        if (!jobId || !prompt || !uploadUrl) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        await executeGenerationWorker({ jobId, prompt, uploadUrl });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[WorkerRoute] Error:', error);
        
        try {
            const body = await req.json().catch(() => ({}));
            if (body.jobId) {
                await failGenerationWorker(body.jobId, error.message);
            }
        } catch (e) {}

        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
