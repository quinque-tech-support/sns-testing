import { GoogleGenerativeAI } from '@google/generative-ai';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PostData {
    id: string;
    caption: string | null;
    likes: number;
    views: number;
    reach: number;
    saves: number;
    mediaType: string;
    createdAt: Date;
}

export interface AnalysisInsight {
    /** Short title summarising the insight */
    title: string;
    /** Detailed explanation */
    description: string;
    /** 'positive' | 'negative' | 'neutral' */
    sentiment: 'positive' | 'negative' | 'neutral';
}

export interface AnalysisPattern {
    /** Name of the identified pattern */
    name: string;
    /** How strongly this pattern correlates with performance (0-100) */
    confidence: number;
    /** Detailed description of the pattern */
    description: string;
    /** Concrete examples found in the posts */
    examples: string[];
}

export interface ImprovedCaption {
    /** The original caption that was improved */
    originalCaption: string;
    /** The improved version */
    improvedCaption: string;
    /** Suggested hashtags */
    hashtags: string[];
    /** Why this improvement should perform better */
    rationale: string;
}

export interface AnalysisResult {
    insights: AnalysisInsight[];
    patterns: AnalysisPattern[];
    improvedCaptions: ImprovedCaption[];
}

// ─── Error Classes ────────────────────────────────────────────────────────────

export class AIAnalysisError extends Error {
    constructor(
        message: string,
        public readonly code: 'API_KEY_MISSING' | 'TIMEOUT' | 'PARSE_ERROR' | 'API_ERROR' | 'NO_DATA',
        public readonly retryable: boolean = false,
        public readonly cause?: unknown
    ) {
        super(message);
        this.name = 'AIAnalysisError';
    }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 2_000;
const MODEL_NAME = 'gemini-3-flash-preview';

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * Build a structured prompt for Gemini from top-performing and low-performing posts.
 */
function buildAnalysisPrompt(topPosts: PostData[], lowPosts: PostData[]): string {
    const formatPost = (p: PostData, i: number) =>
        `投稿${i + 1}:
  キャプション: """${p.caption || '(なし)'}"""
  いいね: ${p.likes}
  閲覧数: ${p.views}
  リーチ: ${p.reach}
  保存数: ${p.saves}
  メディアタイプ: ${p.mediaType}
  投稿日: ${new Date(p.createdAt).toLocaleDateString('ja-JP')}`;

    return `あなたはプロのInstagramアナリスト兼ソーシャルメディアコンサルタントです。
以下のデータを分析して、実用的なインサイトを提供してください。

══════════════════════════════════════
【高パフォーマンス投稿（Top Posts）】
══════════════════════════════════════
${topPosts.length > 0 ? topPosts.map(formatPost).join('\n\n') : '(データなし)'}

══════════════════════════════════════
【低パフォーマンス投稿（Low-Performing Posts）】
══════════════════════════════════════
${lowPosts.length > 0 ? lowPosts.map(formatPost).join('\n\n') : '(データなし)'}

══════════════════════════════════════
【分析タスク】
══════════════════════════════════════

上記の投稿データを比較分析し、以下の3つを導き出してください：

1. **insights** — 高パフォーマンスと低パフォーマンスの違いから得られるインサイト（3〜5個）
2. **patterns** — エンゲージメントに影響するパターン（例：キャプションの長さ、絵文字の使い方、CTA、ハッシュタグ、投稿タイミング等）（2〜4個）
3. **improvedCaptions** — 低パフォーマンス投稿のキャプションを改善した版。高パフォーマンス投稿から学んだパターンを適用してください。

══════════════════════════════════════
【出力フォーマット】
══════════════════════════════════════

以下の厳格なJSON形式で出力してください。マークダウンや解説は一切含めないでください。

{
  "insights": [
    {
      "title": "短い説明",
      "description": "詳細な説明",
      "sentiment": "positive" | "negative" | "neutral"
    }
  ],
  "patterns": [
    {
      "name": "パターン名",
      "confidence": 0-100,
      "description": "パターンの詳しい説明",
      "examples": ["具体例1", "具体例2"]
    }
  ],
  "improvedCaptions": [
    {
      "originalCaption": "元のキャプション",
      "improvedCaption": "改善版キャプション（絵文字含む）",
      "hashtags": ["#ハッシュタグ1", "#ハッシュタグ2"],
      "rationale": "なぜこの改善が効果的か"
    }
  ]
}`;
}

/**
 * Execute a promise with a timeout. Rejects with AIAnalysisError on timeout.
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const timer = setTimeout(
            () => reject(new AIAnalysisError(
                `AI analysis timed out after ${ms}ms`,
                'TIMEOUT',
                true
            )),
            ms
        );

        promise
            .then((value) => { clearTimeout(timer); resolve(value); })
            .catch((err) => { clearTimeout(timer); reject(err); });
    });
}

/**
 * Sleep helper for retry backoff.
 */
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Parse and validate the JSON response from Gemini.
 */
function parseAnalysisResponse(text: string): AnalysisResult {
    // Strip markdown code fences if present
    let cleaned = text.trim();
    if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    let parsed: any;
    try {
        parsed = JSON.parse(cleaned);
    } catch (e) {
        throw new AIAnalysisError(
            'Failed to parse AI response as JSON',
            'PARSE_ERROR',
            true,
            e
        );
    }

    // Validate required top-level fields
    const insights: AnalysisInsight[] = Array.isArray(parsed.insights)
        ? parsed.insights.map((item: any) => ({
            title: String(item.title || ''),
            description: String(item.description || ''),
            sentiment: (['positive', 'negative', 'neutral'].includes(item.sentiment)
                ? item.sentiment
                : 'neutral') as 'positive' | 'negative' | 'neutral',
        }))
        : [];

    const patterns: AnalysisPattern[] = Array.isArray(parsed.patterns)
        ? parsed.patterns.map((item: any) => ({
            name: String(item.name || ''),
            confidence: typeof item.confidence === 'number'
                ? Math.min(100, Math.max(0, item.confidence))
                : 50,
            description: String(item.description || ''),
            examples: Array.isArray(item.examples) ? item.examples.map(String) : [],
        }))
        : [];

    const improvedCaptions: ImprovedCaption[] = Array.isArray(parsed.improvedCaptions)
        ? parsed.improvedCaptions.map((item: any) => ({
            originalCaption: String(item.originalCaption || ''),
            improvedCaption: String(item.improvedCaption || ''),
            hashtags: Array.isArray(item.hashtags) ? item.hashtags.map(String) : [],
            rationale: String(item.rationale || ''),
        }))
        : [];

    if (insights.length === 0 && patterns.length === 0 && improvedCaptions.length === 0) {
        throw new AIAnalysisError(
            'AI returned an empty analysis — no insights, patterns, or captions found',
            'PARSE_ERROR',
            true
        );
    }

    return { insights, patterns, improvedCaptions };
}

/**
 * Analyse Instagram post performance by comparing top posts vs low-performing posts.
 *
 * Features:
 * - Structured prompt construction from post data
 * - Gemini API call with JSON response mode
 * - Timeout handling (default 30s)
 * - Retry logic (at least 1 retry on retryable failures)
 * - Typed, validated response parsing
 *
 * @param topPosts   - Array of high-performing posts (sorted by engagement descending)
 * @param lowPosts   - Array of low-performing posts (sorted by engagement ascending)
 * @param options    - Optional configuration overrides
 * @returns          - Structured analysis with insights, patterns, and improved captions
 * @throws {AIAnalysisError} On unrecoverable failures after retries
 */
export async function analyzePostPerformance(
    topPosts: PostData[],
    lowPosts: PostData[],
    options?: {
        timeoutMs?: number;
        maxRetries?: number;
        apiKey?: string;
    }
): Promise<AnalysisResult> {
    const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const maxRetries = options?.maxRetries ?? MAX_RETRIES;
    const apiKey = options?.apiKey ?? process.env.GEMINI_API_KEY;

    // ── Validate inputs ──────────────────────────────────────────────
    if (!apiKey) {
        throw new AIAnalysisError(
            'Gemini API Key is missing. Set GEMINI_API_KEY in your environment.',
            'API_KEY_MISSING'
        );
    }

    if (topPosts.length === 0 && lowPosts.length === 0) {
        throw new AIAnalysisError(
            'At least one top post or one low-performing post is required for analysis.',
            'NO_DATA'
        );
    }

    // ── Build prompt ─────────────────────────────────────────────────
    const prompt = buildAnalysisPrompt(topPosts, lowPosts);

    // ── Initialize Gemini ────────────────────────────────────────────
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        generationConfig: {
            responseMimeType: 'application/json',
        },
    });

    // ── Call with retry + timeout ────────────────────────────────────
    let lastError: Error | undefined;
    let explicitWaitMs = 0;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            if (attempt > 0) {
                const backoff = explicitWaitMs > 0 ? explicitWaitMs : (RETRY_DELAY_MS * attempt);
                explicitWaitMs = 0; // reset
                console.warn(
                    `[AIAnalysis] Retry ${attempt}/${maxRetries} after ${Math.round(backoff)}ms...`
                );
                await sleep(backoff);
            }

            console.log(
                `[AIAnalysis] Calling Gemini (attempt ${attempt + 1}/${maxRetries + 1}, timeout ${timeoutMs}ms)...`
            );

            const result = await withTimeout(
                model.generateContent(prompt),
                timeoutMs
            );

            const responseText = result.response.text();

            if (!responseText || responseText.trim().length === 0) {
                throw new AIAnalysisError(
                    'Gemini returned an empty response',
                    'API_ERROR',
                    true
                );
            }

            const analysisResult = parseAnalysisResponse(responseText);

            console.log(
                `[AIAnalysis] Success — ${analysisResult.insights.length} insights, ` +
                `${analysisResult.patterns.length} patterns, ` +
                `${analysisResult.improvedCaptions.length} improved captions`
            );

            return analysisResult;
        } catch (error: any) {
            lastError = error;

            const isRetryable =
                error instanceof AIAnalysisError ? error.retryable : true;

            console.error(
                `[AIAnalysis] Attempt ${attempt + 1} failed:`,
                error.message
            );

            // Don't retry non-retryable errors (e.g. missing API key)
            if (!isRetryable) {
                throw error;
            }

            // Parse explicit wait times from Google API 429 errors
            const isRateLimit = String(error).includes('429');
            if (isRateLimit) {
                const match = String(error).match(/Please retry in (\d+\.?\d*)s/);
                if (match && match[1]) {
                    explicitWaitMs = parseFloat(match[1]) * 1000 + 1000;
                }
            }

            // If this was our last attempt, break to throw below
            if (attempt >= maxRetries) {
                break;
            }
        }
    }

    // All retries exhausted
    if (lastError instanceof AIAnalysisError) {
        throw lastError;
    }

    throw new AIAnalysisError(
        `AI analysis failed after ${maxRetries + 1} attempt(s): ${lastError?.message || 'Unknown error'}`,
        'API_ERROR',
        false,
        lastError
    );
}

// ─── Convenience: Fetch + Analyse in one call ─────────────────────────────────

/**
 * Fetch top & bottom posts for a user from the database and run the analysis.
 * This is a higher-level convenience wrapper around `analyzePostPerformance`.
 *
 * @param userId    - The user whose posts to analyse
 * @param projectId - Optional project filter
 * @param options   - Optional config (topN, bottomN, timeoutMs, etc.)
 */
export async function analyzeUserPosts(
    userId: string,
    projectId?: string,
    options?: {
        topN?: number;
        bottomN?: number;
        timeoutMs?: number;
        maxRetries?: number;
    }
): Promise<AnalysisResult> {
    const topN = options?.topN ?? 5;
    const bottomN = options?.bottomN ?? 5;

    // Lazy-import prisma to avoid circular dependency issues
    const { prisma } = await import('@/lib/prisma');

    const baseWhere = {
        userId,
        instagramMediaId: { not: null as string | null },
        caption: { not: null as string | null },
        ...(projectId ? { projectId } : {}),
    };

    // Fetch top posts (highest engagement first)
    const topPosts = await prisma.post.findMany({
        where: baseWhere,
        orderBy: [{ likes: 'desc' }, { views: 'desc' }],
        take: topN,
        select: {
            id: true,
            caption: true,
            likes: true,
            views: true,
            reach: true,
            saves: true,
            mediaType: true,
            createdAt: true,
        },
    });

    // Fetch bottom posts (lowest engagement first), excluding those already in top
    const topIds = topPosts.map((p) => p.id);
    const lowPosts = await prisma.post.findMany({
        where: {
            ...baseWhere,
            id: { notIn: topIds },
        },
        orderBy: [{ likes: 'asc' }, { views: 'asc' }],
        take: bottomN,
        select: {
            id: true,
            caption: true,
            likes: true,
            views: true,
            reach: true,
            saves: true,
            mediaType: true,
            createdAt: true,
        },
    });

    if (topPosts.length === 0 && lowPosts.length === 0) {
        throw new AIAnalysisError(
            'No published posts with captions found to analyse. Publish some posts first!',
            'NO_DATA'
        );
    }

    return analyzePostPerformance(topPosts, lowPosts, {
        timeoutMs: options?.timeoutMs,
        maxRetries: options?.maxRetries,
    });
}
