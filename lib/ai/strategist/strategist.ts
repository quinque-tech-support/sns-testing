import type { FusedContext, Strategy } from '../types';
import { callModel } from '../utils/callModel';
import { validateStrategy } from '../utils/validators';

/**
 * Build a priority-ordered context string for the strategist.
 * Priority: userPrompt > projectContext > visionOutput > historicalAnalysis
 */
function buildContextBlock(ctx: FusedContext): string {
    let text = '';

    text += `═══════════════════════════════════════\n`;
    text += `【INPUT CONTEXT — in strict priority order】\n`;
    text += `═══════════════════════════════════════\n\n`;

    // 1. User Prompt (Highest)
    if (ctx.userPrompt) {
        text += `[1. USER PROMPT — HIGHEST PRIORITY, 70% of deciding factor]\n`;
        text += `${ctx.userPrompt}\n\n`;
    }

    if (ctx.currentCaption) {
        text += `[User's Existing Draft to Enhance]\n${ctx.currentCaption}\n\n`;
    }

    // 2. Project Context
    if (ctx.projectContext) {
        text += `[2. PROJECT CONTEXT]\n`;
        text += `Project: ${ctx.projectContext.title}\n`;
        if (ctx.projectContext.description) text += `Worldview/Guidelines: ${ctx.projectContext.description}\n`;
        if (ctx.projectContext.keywords) text += `Keywords: ${ctx.projectContext.keywords}\n`;
        text += '\n';
    }

    // 3. Vision Analysis
    text += `[3. VISUAL ANALYSIS]\n`;
    text += `Post Type: ${ctx.postType}\n`;
    text += `Anchor Image — Subject: "${ctx.anchorAnalysis.primary_subject}", Scene: "${ctx.anchorAnalysis.scene}", Mood: "${ctx.anchorAnalysis.mood}"\n`;

    if (ctx.sequenceData) {
        text += `Sequence Theme: ${ctx.sequenceData.theme}\n`;
        text += `Narrative Arc: ${ctx.sequenceData.progression.join(' → ')}\n`;
        text += `Emotional Arc: ${ctx.sequenceData.emotional_arc.join(' → ')}\n`;
    }
    text += '\n';

    // 4. Pattern Analysis (from past captions)
    if (ctx.patternData) {
        text += `[4. PAST CAPTION PATTERNS — learn from what worked]\n`;
        text += `Average Length: ${ctx.patternData.avg_length}\n`;
        text += `Emoji Usage: ${ctx.patternData.emoji_usage}\n`;
        text += `Hook Style: ${ctx.patternData.hook_style}\n`;
        text += `Tone: ${ctx.patternData.tone}\n`;
        text += `CTA Style: ${ctx.patternData.CTA_style}\n`;
        text += `Summary: ${ctx.patternData.pattern_summary}\n\n`;
    }

    // 5. Historical Performance Analysis
    if (ctx.analysisContextStr) {
        text += `[5. HISTORICAL PERFORMANCE ANALYSIS]\n`;
        text += ctx.analysisContextStr + '\n\n';
    }

    return text;
}

/**
 * Run the Strategist agent — executes ONCE per pipeline to create a unified
 * strategy that all writer variations will follow.
 *
 * Adapts based on post type, sequence data (if carousel), and all context inputs.
 */
export async function runStrategist(
    ctx: FusedContext,
    apiKey: string
): Promise<Strategy> {
    const contextBlock = buildContextBlock(ctx);

    const prompt = `You are a senior Social Media Strategist specializing in Instagram engagement for the Japanese market.

Your task: Create a precise, data-driven content strategy for a ${ctx.postType} post.

${contextBlock}

Based on all the above context (respecting the priority order), create a strategy.

YOUR STRATEGY MUST:
- Adapt tone, hooks, and CTA to the post type (${ctx.postType})
${ctx.sequenceData ? '- For this carousel: leverage the narrative arc across images' : ''}
${ctx.patternData ? '- Incorporate the learned patterns from past successful captions' : ''}
- Plan 3 distinct caption variation styles for the writer to produce
- Set clear constraints to prevent generic, over-polished AI output

Output JSON:
{
  "tone": "Specific, descriptive tone (e.g., 'warm nostalgic with playful undertones', NOT just 'friendly')",
  "hook_strategy": "Detailed technique for the first line (MUST STRICTLY be under 40 characters)",
  "cta_style": "Specific CTA approach (e.g., 'rhetorical question about shared experience')",
  "target_audience": "Who this caption speaks to specifically",
  "caption_structure": "The structure pattern (e.g., 'hook → personal anecdote → realization → soft CTA')",
  "variation_plan": ["style1_name", "style2_name", "style3_name"],
  "constraints": ["MUST strictly limit the first line (hook) to <= 40 characters", "Other specific tone/content limits"]
}

The variation_plan MUST contain exactly 3 distinct styles chosen from approaches like:
- emotional storytelling (感情的な物語)
- witty/humorous (ウィットに富んだ)
- aesthetic/poetic (美的・詩的)
- bold/provocative (大胆な)
- conversational (会話調)
- informative/educational (教育的)

Choose the 3 styles most appropriate for this specific post's content and mood.`;

    console.log(`[Strategist] Running for ${ctx.postType} post...`);

    const raw = await callModel(apiKey, prompt, {
        label: 'Strategist/runStrategist',
    });

    const strategy = validateStrategy(raw);
    console.log(`[Strategist] Strategy ready — tone: "${strategy.tone}", variations: [${strategy.variation_plan.join(', ')}]`);

    return strategy;
}

/** Re-export the context builder for use by writer/critic/refiner */
export { buildContextBlock };
