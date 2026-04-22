import { z } from 'zod';
import type {
    ImageAnalysis,
    SequenceInterpretation,
    Strategy,
    CriticScore,
    CaptionDraft,
    PatternAnalysis,
} from '../types';

// ─── Image Analysis ───────────────────────────────────────────────────────────

const imageAnalysisSchema = z.object({
    objects: z.array(z.string()).default([]),
    scene: z.string().default('unknown'),
    mood: z.string().default('neutral'),
    actions: z.array(z.string()).default([]),
    primary_subject: z.string().default('unclear'),
    confidence: z.number().min(0).max(1).default(0.5),
});

export function validateImageAnalysis(data: unknown): ImageAnalysis {
    return imageAnalysisSchema.parse(data);
}

// ─── Sequence Interpretation ──────────────────────────────────────────────────

const sequenceSchema = z.object({
    theme: z.string().default('mixed content'),
    progression: z.array(z.string()).default([]),
    emotional_arc: z.array(z.string()).default([]),
    dominant_elements: z.array(z.string()).default([]),
    anchor_focus: z.string().default('primary image'),
});

export function validateSequence(data: unknown): SequenceInterpretation {
    return sequenceSchema.parse(data);
}

// ─── Strategy ─────────────────────────────────────────────────────────────────

const strategySchema = z.object({
    tone: z.string().default('authentic and relatable'),
    hook_strategy: z.string().default('question-based hook'),
    cta_style: z.string().default('soft engagement prompt'),
    target_audience: z.string().default('general Instagram users'),
    caption_structure: z.string().default('hook → story → CTA'),
    variation_plan: z.array(z.string()).default(['emotional storytelling', 'witty', 'aesthetic']),
    constraints: z.array(z.string()).default([]),
});

export function validateStrategy(data: unknown): Strategy {
    return strategySchema.parse(data);
}

// ─── Critic Score ─────────────────────────────────────────────────────────────

const criticScoreSchema = z.object({
    hook_strength: z.number().min(0).max(2).default(1),
    clarity: z.number().min(0).max(2).default(1),
    relatability: z.number().min(0).max(2).default(1),
    image_alignment: z.number().min(0).max(2).default(1),
    engagement_potential: z.number().min(0).max(2).default(1),
    total: z.number().min(0).max(10).default(5),
    issues: z.array(z.string()).default([]),
    suggestions: z.array(z.string()).default([]),
});

export function validateCriticScore(data: unknown): CriticScore {
    return criticScoreSchema.parse(data);
}

// ─── Caption Draft ────────────────────────────────────────────────────────────

const captionDraftSchema = z.object({
    caption: z.string().default(''),
    hashtags: z.array(z.string()).default([]),
});

export function validateCaptionDraft(data: unknown): CaptionDraft {
    return captionDraftSchema.parse(data);
}

// ─── Pattern Analysis ─────────────────────────────────────────────────────────

const patternSchema = z.object({
    avg_length: z.string().default('medium (100-200 chars)'),
    emoji_usage: z.string().default('moderate'),
    hook_style: z.string().default('descriptive'),
    tone: z.string().default('neutral'),
    CTA_style: z.string().default('none detected'),
    pattern_summary: z.string().default('insufficient data for analysis'),
});

export function validatePattern(data: unknown): PatternAnalysis {
    return patternSchema.parse(data);
}

// ─── Safe parse wrapper ───────────────────────────────────────────────────────

/**
 * Attempt to validate with a schema. On failure, log warning and return a
 * best-effort coercion (letting Zod defaults fill gaps).
 */
export function safeParse<T>(
    validator: (data: unknown) => T,
    data: unknown,
    label: string
): T {
    try {
        return validator(data);
    } catch (error) {
        console.warn(`[Validator] ${label} — validation issue, applying defaults:`, error);
        // Try again with an empty object so defaults kick in
        try {
            return validator({});
        } catch {
            throw new Error(`[Validator] ${label} — unrecoverable validation failure`);
        }
    }
}
