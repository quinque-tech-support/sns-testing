import { callModel } from '../utils/callModel';

export interface PromptBuilderContext {
    description: string;
    context?: string;
    category?: string;
    tags?: string[];
}

export interface PromptBuilderResult {
    positivePrompt: string;
    negativePrompt: string;
}

/**
 * Acts as a dual-compiler for Image Generation prompts.
 * Takes user inputs and returns optimized positive and negative prompts.
 */
export async function buildImagePrompt(
    ctx: PromptBuilderContext,
    apiKey: string
): Promise<PromptBuilderResult> {
    const systemInstruction = `You are an expert AI image generation prompt engineer.
Your task is to take a user's simple description and parameters, and compile them into two highly optimized strings for a diffusion-based image generation model: a Positive Prompt and a Negative Prompt.

RULES:
1. The Positive Prompt should be descriptive, comma-separated keywords and phrases, ordering from main subject to style, lighting, camera, and resolution.
2. The Negative Prompt should include things to avoid (e.g., text artifacts, blur, extra limbs, ugly, poorly drawn, deformed, mutated, watermark, signature).
3. If the user provides a 'category' or 'tags', seamlessly integrate them into the Positive Prompt to enhance the specific style.
4. If the user provides 'context' (e.g., brand guidelines or project info), ensure the prompt aligns with it.
5. Do NOT include any conversational text. Return ONLY valid JSON.

INPUTS:
Description: ${ctx.description}
${ctx.category ? `Category: ${ctx.category}` : ''}
${ctx.tags && ctx.tags.length > 0 ? `Tags: ${ctx.tags.join(', ')}` : ''}
${ctx.context ? `Project Context: ${ctx.context}` : ''}

OUTPUT FORMAT (JSON):
{
  "positivePrompt": "optimized comma separated string here",
  "negativePrompt": "comma separated string of things to avoid here"
}`;

    console.log('[PromptBuilder] Generating optimized image prompts...');

    const raw = await callModel(apiKey, systemInstruction, {
        label: 'PromptBuilder/buildImagePrompt',
        maxRetries: 2
    });

    if (!raw || typeof raw.positivePrompt !== 'string' || typeof raw.negativePrompt !== 'string') {
        throw new Error('Invalid response from Gemini model');
    }

    return {
        positivePrompt: raw.positivePrompt,
        negativePrompt: raw.negativePrompt
    };
}
