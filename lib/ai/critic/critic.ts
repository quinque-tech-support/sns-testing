import type { FusedContext, Strategy, CaptionDraft, CriticScore } from '../types';
import { callModel } from '../utils/callModel';
import { validateCriticScore } from '../utils/validators';
import { buildContextBlock } from '../strategist/strategist';

/**
 * Evaluate a draft caption against the strategy, visual context, and quality axes.
 *
 * Scores across 5 axes (0–2 each, total 0–10):
 *   hook_strength — Is the first line compelling?
 *   clarity — Is the message clear and easy to understand?
 *   relatability — Will the target audience connect with this?
 *   image_alignment — Does it match what's in the image(s)?
 *   engagement_potential — Will it drive likes, comments, saves?
 *
 * Returns structured issues and actionable suggestions for the refiner.
 */
export async function runCritic(
    strategy: Strategy,
    draft: CaptionDraft,
    ctx: FusedContext,
    apiKey: string
): Promise<CriticScore> {
    const contextBlock = buildContextBlock(ctx);

    const prompt = `You are a ruthless Social Media Editor. You evaluate Instagram captions with zero tolerance for mediocrity.

${contextBlock}

[STRATEGY BRIEF]
${JSON.stringify(strategy, null, 2)}

[DRAFT CAPTION TO EVALUATE]
Caption: ${draft.caption}
Hashtags: ${draft.hashtags.join(' ')}

EVALUATION AXES (score each 0-2):
- hook_strength (0-2): Is the first line compelling AND strictly <= 40 characters? (0 if over 40 chars)
- clarity (0-2): Is the message crystal clear? No confusion, no ambiguity?
- relatability (0-2): Will the target audience feel this was written for THEM?
- image_alignment (0-2): Does the caption genuinely match the visual content?
- engagement_potential (0-2): Will this drive real actions (saves, comments, shares)?

SCORING GUIDE:
- 0 = Fails this criterion
- 1 = Acceptable but not impressive
- 2 = Excellent, genuinely strong

BE STRICT. Score inflation helps no one.

Also evaluate:
- Does it follow the strategy brief?
- Does it avoid the constraints listed?
- Does the hook work within Instagram's first 40 characters limit? (CRITICAL)
${ctx.patternData ? '- Does it maintain consistency with past caption patterns?' : ''}

Output JSON:
{
  "hook_strength": 0-2,
  "clarity": 0-2,
  "relatability": 0-2,
  "image_alignment": 0-2,
  "engagement_potential": 0-2,
  "total": 0-10,
  "issues": ["Specific problem 1", "Specific problem 2"],
  "suggestions": ["Concrete fix 1", "Concrete fix 2"]
}

IMPORTANT: "total" must equal the sum of the 5 individual scores.
If there are no issues, return empty arrays. Do NOT invent problems.`;

    console.log(`[Critic] Evaluating draft (${draft.caption.substring(0, 30)}...)...`);

    const raw = await callModel(apiKey, prompt, {
        label: 'Critic/runCritic',
    });

    const score = validateCriticScore(raw);

    // Recalculate total to prevent hallucinated totals
    const calculatedTotal = score.hook_strength + score.clarity + score.relatability +
        score.image_alignment + score.engagement_potential;
    score.total = calculatedTotal;

    console.log(`[Critic] Score: ${score.total}/10 (hook:${score.hook_strength} clarity:${score.clarity} relate:${score.relatability} img:${score.image_alignment} engage:${score.engagement_potential})`);

    if (score.issues.length > 0) {
        console.log(`[Critic] Issues: ${score.issues.join('; ')}`);
    }

    return score;
}
