import type { ImagePart, ImageAnalysis } from '../types';
import { callModel } from '../utils/callModel';
import { validateImageAnalysis } from '../utils/validators';

/**
 * Analyze a single image using Gemini vision capabilities.
 *
 * Returns structured, factual information about the image:
 * objects, scene, mood, actions, primary subject, and confidence.
 */
export async function analyzeImage(
    imagePart: ImagePart,
    apiKey: string
): Promise<ImageAnalysis> {
    const prompt = `You are a vision analysis system. Your job is to extract structured, factual information from the provided image.

Return ONLY valid JSON matching this exact schema:

{
  "objects": ["list of clearly visible objects"],
  "scene": "short description of environment",
  "mood": "emotional tone (e.g., happy, calm, energetic, chaotic, serene, melancholic)",
  "actions": ["what is happening in the image"],
  "primary_subject": "main focus of the image",
  "confidence": 0.0 to 1.0
}

Rules:
- Be precise, not poetic
- Do NOT assume unclear things — only describe what is visually present
- If unsure about elements, reduce confidence accordingly
- Avoid generic words like "nice", "beautiful", "good"
- Focus only on what is visually inferable from the image
- "confidence" reflects how clear and unambiguous the image content is`;

    console.log('[Vision] Analyzing image...');

    const raw = await callModel(apiKey, prompt, {
        imageParts: [imagePart],
        label: 'Vision/analyzeImage',
    });

    const analysis = validateImageAnalysis(raw);
    console.log(`[Vision] Result — subject: "${analysis.primary_subject}", mood: "${analysis.mood}", confidence: ${analysis.confidence}`);

    return analysis;
}
