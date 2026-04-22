import type { ImageAnalysis, SequenceInterpretation, PostType } from '../types';
import { callModel } from '../utils/callModel';
import { validateSequence } from '../utils/validators';

/**
 * Detect post type based on image count.
 */
export function detectPostType(imageCount: number): PostType {
    if (imageCount <= 1) return 'single';
    if (imageCount <= 3) return 'small-carousel';
    return 'story-carousel';
}

/**
 * Select the anchor (primary) image from a set of analyses.
 *
 * Selection criteria (weighted):
 * 1. Highest confidence (image clarity)
 * 2. Clearest primary subject (not "unclear")
 * 3. Strongest emotional signal (mood is not "neutral")
 */
export function selectAnchorImage(analyses: ImageAnalysis[]): {
    anchor: ImageAnalysis;
    anchorIndex: number;
} {
    if (analyses.length === 0) {
        throw new Error('[Sequence] No image analyses to select anchor from');
    }

    if (analyses.length === 1) {
        return { anchor: analyses[0], anchorIndex: 0 };
    }

    let bestIndex = 0;
    let bestScore = -1;

    for (let i = 0; i < analyses.length; i++) {
        const a = analyses[i];
        let score = 0;

        // Confidence is the primary factor (0-1 scaled to 0-50)
        score += a.confidence * 50;

        // Clear subject bonus (+20)
        if (a.primary_subject && a.primary_subject !== 'unclear') {
            score += 20;
        }

        // Emotional signal bonus (+15)
        if (a.mood && a.mood !== 'neutral' && a.mood !== 'unknown') {
            score += 15;
        }

        // Rich content bonus (more objects/actions = more to write about)
        score += Math.min(a.objects.length, 5) * 2;
        score += Math.min(a.actions.length, 3) * 3;

        if (score > bestScore) {
            bestScore = score;
            bestIndex = i;
        }
    }

    console.log(`[Sequence] Anchor image selected: index ${bestIndex} (score: ${bestScore.toFixed(1)})`);
    return { anchor: analyses[bestIndex], anchorIndex: bestIndex };
}

/**
 * Interpret a sequence of images for carousel posts.
 *
 * Derives a narrative theme, progression, emotional arc,
 * and dominant visual elements from the full set of image analyses.
 */
export async function interpretSequence(
    analyses: ImageAnalysis[],
    apiKey: string
): Promise<SequenceInterpretation> {
    const summaries = analyses.map((a, i) => (
        `Image ${i + 1}:\n` +
        `  Subject: ${a.primary_subject}\n` +
        `  Scene: ${a.scene}\n` +
        `  Mood: ${a.mood}\n` +
        `  Objects: ${a.objects.join(', ')}\n` +
        `  Actions: ${a.actions.join(', ')}`
    )).join('\n\n');

    const prompt = `You are a visual storytelling analyst. Given the following sequence of images (in order), determine the narrative structure.

${summaries}

Output JSON:
{
  "theme": "The overarching theme or story connecting these images",
  "progression": ["What happens in image 1", "What happens in image 2", ...],
  "emotional_arc": ["Emotion in image 1", "Emotion in image 2", ...],
  "dominant_elements": ["Visual elements that appear across multiple images"],
  "anchor_focus": "The most impactful visual/story element to build a caption around"
}

Rules:
- Focus on the visual narrative — what story do these images tell together?
- Identify progression: before→after, journey, transformation, collection, etc.
- Keep descriptions factual and concise`;

    console.log(`[Sequence] Interpreting ${analyses.length}-image sequence...`);

    const raw = await callModel(apiKey, prompt, {
        label: 'Sequence/interpretSequence',
    });

    const result = validateSequence(raw);
    console.log(`[Sequence] Theme: "${result.theme}", Arc: [${result.emotional_arc.join(' → ')}]`);

    return result;
}
