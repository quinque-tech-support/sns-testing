import { Redis } from '@upstash/redis';
import { createClient } from '@supabase/supabase-js';
import { Client as QStashClient } from '@upstash/qstash';
import { prisma } from '@/lib/prisma';
import { buildImagePrompt } from './promptBuilder';

const redis = Redis.fromEnv();
const qstash = new QStashClient({ token: process.env.QSTASH_TOKEN || 'dummy' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface StartGenerationOptions {
    userId: string;
    description: string;
    context?: string;
    category?: string;
    tags?: string[];
    projectId?: string;
    positivePrompt?: string;
    negativePrompt?: string;
}

/**
 * Initiates the image generation process by generating prompts, creating a storage URL,
 * saving the initial state in Redis, and pushing a background job to QStash.
 */
export async function startGenerationJob(options: StartGenerationOptions) {
    const { userId, description, context, category, tags, projectId, positivePrompt, negativePrompt } = options;

    let finalPositivePrompt = positivePrompt;
    let finalNegativePrompt = negativePrompt;

    if (!finalPositivePrompt) {
        const promptResult = await buildImagePrompt(
            { description, context, category, tags },
            process.env.GEMINI_API_KEY!
        );
        finalPositivePrompt = promptResult.positivePrompt;
        finalNegativePrompt = promptResult.negativePrompt;
    }

    const jobId = `img_job_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const imagePath = `${userId}/${jobId}.png`;

    const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('project-images')
        .createSignedUploadUrl(imagePath);

    if (uploadError || !uploadData) {
        console.error('[GenerateImage] Failed to create upload URL:', uploadError);
        throw new Error('Failed to create storage link');
    }

    const { data: publicUrlData } = supabase
        .storage
        .from('project-images')
        .getPublicUrl(imagePath);

    await redis.set(`job:${jobId}`, {
        status: 'IN_PROGRESS',
        prompt: finalPositivePrompt,
        negativePrompt: finalNegativePrompt || '',
        imageUrl: publicUrlData.publicUrl,
        userId: userId,
        projectId: projectId || undefined,
        storagePath: imagePath,
        fileName: `${jobId}.png`,
        createdAt: Date.now(),
    }, { ex: 3600 });

    const baseUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const workerUrl = `${baseUrl}/api/ai/generate-image/worker`;
    
    const payload = {
        jobId,
        prompt: finalPositivePrompt,
        negativePrompt: finalNegativePrompt,
        uploadUrl: uploadData.signedUrl
    };

    await qstash.publishJSON({
        url: workerUrl,
        body: payload
    });

    return {
        jobId,
        status: 'IN_PROGRESS',
        imageUrl: publicUrlData.publicUrl
    };
}

/**
 * The actual worker logic that executes the AI model call and uploads the image.
 * This is triggered by QStash.
 */
export async function executeGenerationWorker(payload: { jobId: string, prompt: string, uploadUrl: string }) {
    const { jobId, prompt, uploadUrl } = payload;
    
    console.log(`[Worker] Starting image generation for job ${jobId}`);

    const imageRes = await fetch(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`);
    
    if (!imageRes.ok) {
        const errText = await imageRes.text();
        throw new Error(`Failed to generate image: ${imageRes.status} ${imageRes.statusText} - ${errText}`);
    }

    const imageBuffer = await imageRes.arrayBuffer();

    // Check if job was cancelled while generating
    const jobStatus: any = await redis.get(`job:${jobId}`);
    if (!jobStatus || jobStatus.status === 'CANCELLED') {
        console.log(`[Worker] Job ${jobId} was cancelled. Aborting upload.`);
        return; // Abort silently without error
    }

    const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: imageBuffer,
        headers: {
            'Content-Type': 'image/png'
        }
    });

    if (!uploadRes.ok) {
        throw new Error('Failed to upload image to Supabase');
    }

    console.log(`[Worker] Image uploaded successfully for job ${jobId}`);

    // Trigger webhook
    const baseUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const webhookUrl = `${baseUrl}/api/ai/generate-image/webhook`;
    await fetch(webhookUrl, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'x-webhook-secret': process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret' 
        },
        body: JSON.stringify({
            jobId,
            status: 'COMPLETED'
        })
    });
}

/**
 * Helper to trigger the webhook with a failed status if the worker crashes
 */
export async function failGenerationWorker(jobId: string, errorMsg: string) {
    try {
        const baseUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const webhookUrl = `${baseUrl}/api/ai/generate-image/webhook`;
        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-webhook-secret': process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret'
            },
            body: JSON.stringify({
                jobId,
                status: 'FAILED',
                error: errorMsg
            })
        });
    } catch (e) {
        console.error('[Worker] Failed to send failure webhook:', e);
    }
}

/**
 * Webhook handler to finalize the job by updating Redis and inserting into the DB.
 */
export async function finalizeGenerationWebhook(jobId: string, status: string, error?: string) {
    console.log(`[GenerateImageWebhook] Updating job ${jobId} to ${status}`);

    const jobData: any = await redis.get(`job:${jobId}`);

    if (!jobData) {
        throw new Error('Job not found');
    }

    if (jobData.status === 'CANCELLED') {
        console.log(`[GenerateImageWebhook] Job ${jobId} was cancelled, skipping save.`);
        return;
    }

    if (status === 'COMPLETED' && jobData.userId) {
        try {
            let finalProjectId = jobData.projectId || undefined;
            if (!finalProjectId) {
                const generalProject = await prisma.project.findFirst({
                    where: { userId: jobData.userId, name: 'General' }
                });
                if (generalProject) {
                    finalProjectId = generalProject.id;
                }
            }

            await prisma.projectImage.create({
                data: {
                    projectId: finalProjectId,
                    userId: jobData.userId,
                    url: jobData.imageUrl,
                    storagePath: jobData.storagePath,
                    fileName: jobData.fileName,
                    prompt: jobData.prompt || undefined,
                    negativePrompt: jobData.negativePrompt || undefined,
                    source: 'AI_GENERATED',
                }
            });
            console.log(`[GenerateImageWebhook] Saved image to DB (Project: ${jobData.projectId || 'None'})`);
        } catch (dbError) {
            console.error('[GenerateImageWebhook] Failed to save to DB:', dbError);
        }
    }

    await redis.set(`job:${jobId}`, {
        ...jobData,
        status,
        error: error || undefined,
        updatedAt: Date.now(),
    }, { ex: 86400 });
}
