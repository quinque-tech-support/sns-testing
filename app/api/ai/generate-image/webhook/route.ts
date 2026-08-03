import { NextRequest, NextResponse } from 'next/server';
import { finalizeGenerationWebhook } from '@/lib/ai/vision/imageGeneration';
import { getWebhookSecret } from '@/lib/webhook-secret';

export async function POST(req: NextRequest) {
    try {
        const secret = req.headers.get('x-webhook-secret');
        const expectedSecret = getWebhookSecret();
        if (secret !== expectedSecret) {
            console.error('[GenerateImageWebhookRoute] Unauthorized: Invalid webhook secret');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { jobId, status, error } = body;

        if (!jobId || !status) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        await finalizeGenerationWebhook(jobId, status, error);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[GenerateImageWebhookRoute] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
