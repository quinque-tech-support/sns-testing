import type { PatternAnalysis } from '../types';
import { callModel } from '../utils/callModel';
import { validatePattern } from '../utils/validators';

/**
 * Analyze past captions to extract repeating patterns, style preferences,
 * and engagement drivers. This is MANDATORY — it enables the platform to
 * continuously learn and improve caption quality over time.
 *
 * The extracted patterns are fed into the strategist and writer so that
 * new captions stay consistent with the user's established voice while
 * incorporating proven engagement tactics.
 */
export async function analyzePatterns(
    pastCaptions: string[],
    apiKey: string
): Promise<PatternAnalysis> {
    // Even with few captions, we still run analysis to establish baseline
    const captionList = pastCaptions
        .filter(c => c && c.trim().length > 0)
        .slice(0, 20) // Cap at 20 to keep prompt size reasonable
        .map((c, i) => `Caption ${i + 1}:\n"""${c}"""\n`)
        .join('\n');

    if (!captionList) {
        console.log('[Pattern] No past captions available — returning baseline defaults');
        return {
            avg_length: 'no data',
            emoji_usage: 'no data',
            hook_style: 'no data',
            tone: 'no data',
            CTA_style: 'no data',
            pattern_summary: 'No past captions available. This is the first generation — establish a strong initial voice.',
        };
    }

    const prompt = `You are a content pattern analyst. Analyze the following past Instagram captions from the same account/project to extract consistent patterns and style fingerprints.

${captionList}

Analyze these captions and extract:

{
  "avg_length": "Description of typical length (e.g., 'short 50-80 chars', 'medium 100-200 chars', 'long 300+ chars')",
  "emoji_usage": "How emojis are used (e.g., 'heavy — 5+ per caption', 'moderate — 2-3 key emojis', 'minimal — 0-1', 'strategic — used as bullet points')",
  "hook_style": "How the first line typically opens (e.g., 'question-based', 'bold statement', 'emoji-led', 'story opening')",
  "tone": "The consistent voice/tone (e.g., 'casual and warm', 'professional but approachable', 'playful and energetic')",
  "CTA_style": "How calls-to-action are handled (e.g., 'direct ask — save this post', 'soft — share your thoughts', 'none', 'question-based')",
  "pattern_summary": "A 2-3 sentence summary of the most important patterns the writer MUST follow to maintain consistency"
}

Rules:
- Be specific — generic descriptions are useless
- If patterns are inconsistent, say so and recommend the strongest pattern
- Focus on what makes these captions WORK (or not work)
- The summary should be actionable instructions for a caption writer`;

    console.log(`[Pattern] Analyzing ${pastCaptions.length} past captions...`);

    const raw = await callModel(apiKey, prompt, {
        label: 'Pattern/analyzePatterns',
    });

    const result = validatePattern(raw);
    console.log(`[Pattern] Analysis complete — hook: "${result.hook_style}", tone: "${result.tone}"`);

    return result;
}
