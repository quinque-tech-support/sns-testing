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
    /** User ID for pattern caching */
    userId?: string;
    /** Project ID for pattern caching */
    projectId?: string;
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

// ─── Pattern Analysis ─────────────────────────────────────────────────────────

export interface PatternAnalysis {
    avg_length: string;
    emoji_usage: string;
    hook_style: string;
    tone: string;
    CTA_style: string;
    pattern_summary: string;
}

// ─── Caption Draft ────────────────────────────────────────────────────────────

export interface CaptionDraft {
    caption: string;
    hashtags: string[];
}

// ─── Pipeline Output ──────────────────────────────────────────────────────────

export interface CaptionResult {
    text: string;
    hashtags: string[];
    rationale: string;
}

export interface PipelineOutput {
    caption: CaptionResult;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const MAX_IMAGES = 10;
export const MODEL_NAME = 'gemini-2.5-flash-lite';
