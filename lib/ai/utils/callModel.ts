import { GoogleGenerativeAI } from '@google/generative-ai';
import { MODEL_NAME, type ImagePart } from '../types';
import { withRetry } from './retry';

/**
 * Shared Gemini model caller used by every pipeline stage.
 *
 * - Sends prompt + optional image parts
 * - Requests JSON response format
 * - Strips markdown fences before parsing
 * - Retries on 429/503/parse errors
 */
export async function callModel(
    apiKey: string,
    prompt: string,
    options?: {
        imageParts?: ImagePart[];
        maxRetries?: number;
        label?: string;
    }
): Promise<any> {
    const label = options?.label ?? 'callModel';

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        generationConfig: {
            responseMimeType: 'application/json',
        },
    });

    const parts: any[] = [prompt];
    if (options?.imageParts) {
        parts.push(...options.imageParts);
    }

    return withRetry(
        async () => {
            const result = await model.generateContent(parts);
            let text = result.response.text().trim();

            // Strip markdown code fences if model hallucinates them
            if (text.startsWith('```')) {
                text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
            }

            return JSON.parse(text);
        },
        {
            maxRetries: options?.maxRetries ?? 1,
            label,
        }
    );
}
