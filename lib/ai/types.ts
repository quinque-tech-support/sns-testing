// ─── Pipeline Input / Output ──────────────────────────────────────────────────

export interface ImagePart {
    inlineData: {
        data: string;
        mimeType: string;
    };
}

export interface ProjectContext {
    title: string;
    description?: string;
    keywords?: string;
}

export interface PipelineInput {
    /** Base64 encoded images with mimeType */
    images: ImagePart[];
    /** Project-level context (title, description, keywords) */
    projectContext?: ProjectContext;
    /** User's free-text prompt — highest priority override */
    userPrompt?: string;
    /** Existing draft caption to enhance */
    currentCaption?: string;
    /** Past captions from published posts — used for pattern learning */
    pastCaptions?: string[];
    /** Gemini API key */
    apiKey: string;
    /** Historical analysis context string (from ai-analysis.service) */
    analysisContextStr?: string;
}

export type PostType = 'single' | 'small-carousel' | 'story-carousel';

// ─── Vision Analysis ──────────────────────────────────────────────────────────

export interface ImageAnalysis {
    objects: string[];
    scene: string;
    mood: string;
    actions: string[];
    primary_subject: string;
    confidence: number;
}

// ─── Sequence Interpretation ──────────────────────────────────────────────────

export interface SequenceInterpretation {
    theme: string;
    progression: string[];
    emotional_arc: string[];
    dominant_elements: string[];
    anchor_focus: string;
}

// ─── Strategist ───────────────────────────────────────────────────────────────

export interface Strategy {
    tone: string;
    hook_strategy: string;
    cta_style: string;
    target_audience: string;
    caption_structure: string;
    variation_plan: string[];
    constraints: string[];
}

// ─── Pattern Analysis ─────────────────────────────────────────────────────────

export interface PatternAnalysis {
    avg_length: string;
    emoji_usage: string;
    hook_style: string;
    tone: string;
    CTA_style: string;
    pattern_summary: string;
}

// ─── Critic ───────────────────────────────────────────────────────────────────

export interface CriticScore {
    hook_strength: number;
    clarity: number;
    relatability: number;
    image_alignment: number;
    engagement_potential: number;
    total: number;
    issues: string[];
    suggestions: string[];
}

// ─── Caption Draft ────────────────────────────────────────────────────────────

export interface CaptionDraft {
    caption: string;
    hashtags: string[];
}

// ─── Pipeline Output ──────────────────────────────────────────────────────────

export interface CaptionResult {
    text: string;
    score: number;
    style: string;
    hashtags: string[];
    rationale: string;
}

export interface PipelineOutput {
    /** Single best caption (highest scored) */
    caption: CaptionResult;
    strategist_summary: Strategy;
}

// ─── Internal context passed between stages ───────────────────────────────────

export interface FusedContext {
    userPrompt?: string;
    currentCaption?: string;
    projectContext?: ProjectContext;
    analysisContextStr?: string;
    visionSummary: string;
    sequenceData?: SequenceInterpretation;
    patternData?: PatternAnalysis;
    postType: PostType;
    anchorAnalysis: ImageAnalysis;
    allAnalyses: ImageAnalysis[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const MAX_IMAGES = 10;
export const MODEL_NAME = 'gemini-2.0-flash';
export const TARGET_SCORE = 8;
export const MAX_REFINE_ITERATIONS = 2;
