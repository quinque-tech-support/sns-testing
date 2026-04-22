import type { FusedContext, Strategy, CaptionDraft, CriticScore } from '../types';
import { TARGET_SCORE } from '../types';
import { callModel } from '../utils/callModel';
import { validateCaptionDraft } from '../utils/validators';
import { buildContextBlock } from '../strategist/strategist';

/**
 * Refine a draft caption based on critic feedback.
 *
 * Two modes:
 * - If score < TARGET_SCORE (8): FIX — address specific issues
 * - If score >= TARGET_SCORE: ENHANCE — polish for maximum impact
 *
 * ALL OUTPUT IS IN JAPANESE.
 */
export async function runRefiner(
    strategy: Strategy,
    draft: CaptionDraft,
    criticResult: CriticScore,
    ctx: FusedContext,
    apiKey: string
): Promise<CaptionDraft> {
    const isEnhanceMode = criticResult.total >= TARGET_SCORE;
    const mode = isEnhanceMode ? 'ENHANCE' : 'FIX';

    const contextBlock = buildContextBlock(ctx);

    const prompt = `You are a Master Editor for Instagram captions. Mode: ${mode}.
ALL OUTPUT MUST BE IN JAPANESE (日本語).

${contextBlock}

[STRATEGY BRIEF]
${JSON.stringify(strategy, null, 2)}

[CURRENT DRAFT]
Caption: ${draft.caption}
Hashtags: ${draft.hashtags.join(' ')}

[CRITIC EVALUATION — Score: ${criticResult.total}/10]
Scores: hook=${criticResult.hook_strength}, clarity=${criticResult.clarity}, relatability=${criticResult.relatability}, image=${criticResult.image_alignment}, engagement=${criticResult.engagement_potential}

${isEnhanceMode ? `[ENHANCEMENT MODE]
The draft scored ${criticResult.total}/10 — already good. Your job:
- Make the hook even MORE compelling (BUT STRICTLY KEEP IT <= 40 CHARS)
- Sharpen the emotional resonance
- Ensure the CTA feels effortless
- Polish word choice for maximum impact
- Keep everything that works, elevate what could be better
- CRITICAL: The FIRST LINE (hook) MUST remain <= 40 characters
${criticResult.suggestions.length > 0 ? `\nSuggestions to consider:\n${criticResult.suggestions.map(s => `- ${s}`).join('\n')}` : ''}` 

: `[FIX MODE]
The draft scored ${criticResult.total}/10 — needs improvement. Your job:
- Fix these specific issues:\n${criticResult.issues.map(i => `  ❌ ${i}`).join('\n')}
${criticResult.suggestions.length > 0 ? `\n- Apply these suggestions:\n${criticResult.suggestions.map(s => `  💡 ${s}`).join('\n')}` : ''}
-CRITICAL FIX RULES:
1. Address EVERY issue raised by the critic.
2. The FIRST LINE (hook) must strictly be <= 40 characters. No exceptions.
3. Keep the output fully in Japanese.
- Do NOT lose the good parts of the draft
- Maintain the same variation style
`}

Output JSON:
{
  "caption": "The revised caption in Japanese",
  "hashtags": ["#hashtag1", "#hashtag2", "..."]
}`;

    console.log(`[Refiner] ${mode} mode — score was ${criticResult.total}/10`);

    const raw = await callModel(apiKey, prompt, {
        label: `Refiner/${mode}`,
    });

    const refined = validateCaptionDraft(raw);
    console.log(`[Refiner] Refined draft ready — ${refined.caption.length} chars`);

    return refined;
}
