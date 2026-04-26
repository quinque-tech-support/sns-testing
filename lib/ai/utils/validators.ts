import { z } from 'zod';
import type {
    ImageAnalysis,
    SequenceInterpretation,
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
