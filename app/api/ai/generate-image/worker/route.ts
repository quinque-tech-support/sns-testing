import { NextRequest, NextResponse } from 'next/server';
import { executeGenerationWorker, failGenerationWorker } from '@/lib/ai/vision/imageGeneration';
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";

export const maxDuration = 60; // Prevent Vercel timeouts for slow image generation


async function workerHandler(req: Request) {
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
            // Error handling fallback for failed generation
        } catch (e) {}

        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

const isDevOrTest = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
const appUrl = process.env.NEXTAUTH_URL || 'https://gravia.vercel.app';
const workerUrl = `${appUrl.endsWith('/') ? appUrl.slice(0, -1) : appUrl}/api/ai/generate-image/worker`;

export const POST = isDevOrTest
    ? workerHandler
    : verifySignatureAppRouter(workerHandler, {
        url: workerUrl
    });
