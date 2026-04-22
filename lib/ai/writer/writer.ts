import type { FusedContext, Strategy, CaptionDraft } from '../types';
import { callModel } from '../utils/callModel';
import { validateCaptionDraft } from '../utils/validators';
import { buildContextBlock } from '../strategist/strategist';

/**
 * Generate a single caption draft following the strategy brief and a specific
 * variation style. Each invocation produces a distinct style of caption.
 *
 * ALL OUTPUT IS IN JAPANESE — this is a Japanese-market Instagram platform.
 */
export async function runWriter(
    strategy: Strategy,
    ctx: FusedContext,
    variationType: string,
    apiKey: string
): Promise<CaptionDraft> {
    const contextBlock = buildContextBlock(ctx);

    const prompt = `You are a world-class Instagram copywriter specializing in the Japanese market.
ALL OUTPUT MUST BE IN JAPANESE (日本語).

Your task: Write a single, highly engaging Instagram caption in the "${variationType}" style.

${contextBlock}

[STRATEGY BRIEF — FOLLOW PRECISELY]
${JSON.stringify(strategy, null, 2)}

[YOUR SPECIFIC VARIATION STYLE: "${variationType}"]
Write the caption in this specific style. Make it feel distinctly different from other styles.

CRITICAL RULES:
1. 出力はすべて日本語で書いてください
2. The FIRST LINE is the hook. It MUST be 40 characters or less (Strict constraint). Cut to the core message instantly.
3. Do NOT simply describe the image — tell a story, share a feeling, provoke thought
4. Match the strategy's tone precisely
5. Include the CTA naturally, not forced
6. Keep it human — avoid sounding like a corporate AI or marketing template
7. Hashtags should be a strategic mix of Japanese + English, broad + niche (8-15 total)
${ctx.patternData ? `8. MAINTAIN CONSISTENCY with past patterns: ${ctx.patternData.pattern_summary}` : ''}

Output JSON:
{
  "caption": "The full caption text in Japanese",
  "hashtags": ["#hashtag1", "#hashtag2", "..."]
}`;

    console.log(`[Writer] Generating "${variationType}" draft...`);

    const raw = await callModel(apiKey, prompt, {
        label: `Writer/${variationType}`,
    });

    const draft = validateCaptionDraft(raw);
    console.log(`[Writer] "${variationType}" draft ready — ${draft.caption.length} chars, ${draft.hashtags.length} hashtags`);

    return draft;
}
