import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { prisma } from '@/lib/prisma';
import { analyzePostPerformance, type PostData, type AnalysisResult } from '@/lib/ai-analysis.service';
import { generateCaptions } from '@/lib/ai/pipeline/generateCaptions';
import type { PipelineInput, ImagePart, ProjectContext } from '@/lib/ai/types';

export const maxDuration = 120; // Allow up to 120s — multi-stage pipeline needs time

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Gemini API Key is missing in environment.' }, { status: 500 });
        }

        const body = await req.json();
        const {
            // New multi-image format
            images: rawImages,
            // Legacy single-image format (backward compat)
            imageBase64,
            mimeType,
            // Common fields
            customPrompt,
            currentCaption,
            projectId,
        } = body;

        // ── 1. Build image parts (support both new and legacy format) ────
        const imageParts: ImagePart[] = [];

        if (rawImages && Array.isArray(rawImages) && rawImages.length > 0) {
            // New format: images[] array
            for (const img of rawImages) {
                if (img.base64 && img.mimeType) {
                    const data = img.base64.includes(',')
                        ? img.base64.split(',')[1]
                        : img.base64;
                    imageParts.push({
                        inlineData: { data, mimeType: img.mimeType },
                    });
                }
            }
        } else if (imageBase64 && mimeType) {
            // Legacy format: single imageBase64 + mimeType
            const data = imageBase64.includes(',')
                ? imageBase64.split(',')[1]
                : imageBase64;
            imageParts.push({
                inlineData: { data, mimeType },
            });
        }

        // ── 2. Fetch project context + historical data ───────────────────
        let projectContext: ProjectContext | undefined;
        let analysisContextStr = '';
        let pastCaptions: string[] = [];

        if (projectId) {
            const project = await prisma.project.findUnique({
                where: { id: projectId, userId: session.user.id },
            });

            if (project) {
                projectContext = {
                    title: project.name,
                    description: project.description || undefined,
                    keywords: project.keywords || undefined,
                };
            }

            // Fetch published posts for this project
            const publishedPostsWhere = {
                projectId,
                userId: session.user.id,
                caption: { not: null as string | null },
                instagramMediaId: { not: null as string | null },
            };

            const [topPosts, lowPosts] = await Promise.all([
                prisma.post.findMany({
                    where: publishedPostsWhere,
                    orderBy: [{ likes: 'desc' }, { views: 'desc' }],
                    take: 5,
                    select: { id: true, caption: true, likes: true, views: true, reach: true, saves: true, mediaType: true, createdAt: true },
                }),
                prisma.post.findMany({
                    where: publishedPostsWhere,
                    orderBy: [{ likes: 'asc' }, { views: 'asc' }],
                    take: 5,
                    select: { id: true, caption: true, likes: true, views: true, reach: true, saves: true, mediaType: true, createdAt: true },
                }),
            ]);

            // Deduplicate
            const topIds = new Set(topPosts.map(p => p.id));
            const dedupedLowPosts = lowPosts.filter(p => !topIds.has(p.id));

            // Extract past captions for pattern analysis (mandatory)
            pastCaptions = topPosts
                .map(p => p.caption)
                .filter((c): c is string => c != null && c.trim().length > 0);

            // Run AI performance analysis on historical posts
            if (topPosts.length > 0) {
                try {
                    console.log(`[/api/generate] Analysing ${topPosts.length} top + ${dedupedLowPosts.length} low posts for project ${projectId}...`);

                    const analysis: AnalysisResult = await analyzePostPerformance(
                        topPosts as PostData[],
                        dedupedLowPosts as PostData[],
                        { timeoutMs: 25_000, maxRetries: 1, apiKey }
                    );

                    analysisContextStr = buildAnalysisContext(analysis, topPosts);

                    console.log(`[/api/generate] Analysis complete — ${analysis.insights.length} insights, ${analysis.patterns.length} patterns`);
                } catch (analysisErr: any) {
                    console.warn(`[/api/generate] Analysis failed (non-fatal), falling back to raw history:`, analysisErr.message);
                    analysisContextStr = buildFallbackHistoryContext(topPosts);
                }
            }
        }

        // ── 3. Build pipeline input and run ──────────────────────────────
        const pipelineInput: PipelineInput = {
            images: imageParts,
            projectContext,
            userPrompt: customPrompt || undefined,
            currentCaption: currentCaption || undefined,
            pastCaptions,
            apiKey,
            analysisContextStr: analysisContextStr || undefined,
        };

        const result = await generateCaptions(pipelineInput);

        // ── 4. Return response ───────────────────────────────────────────
        // Return as single best caption in the options format (client compat)
        return NextResponse.json({
            options: [{
                caption: result.caption.text,
                hashtags: result.caption.hashtags,
                rationale: result.caption.rationale,
                style: result.caption.style,
                score: result.caption.score,
            }],
            strategist_summary: result.strategist_summary,
        });
    } catch (error: any) {
        const message = error?.message || String(error) || 'Unknown error';
        console.error('[/api/generate] Error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// ─── Helpers (preserved from original) ────────────────────────────────────────

function buildAnalysisContext(
    analysis: AnalysisResult,
    topPosts: { caption: string | null; likes: number; views: number }[]
): string {
    let ctx = '\n══════════════════════════════════════\n';
    ctx += '【AIパフォーマンス分析結果】\n';
    ctx += '以下は過去の投稿データをAIが分析した結果です。この分析に基づいてキャプションを作成してください。\n';
    ctx += '══════════════════════════════════════\n\n';

    if (analysis.insights.length > 0) {
        ctx += '▼ 発見されたインサイト:\n';
        analysis.insights.forEach((insight, i) => {
            ctx += `  ${i + 1}. [${insight.sentiment === 'positive' ? '✅' : insight.sentiment === 'negative' ? '⚠️' : 'ℹ️'}] ${insight.title}\n`;
            ctx += `     ${insight.description}\n`;
        });
        ctx += '\n';
    }

    if (analysis.patterns.length > 0) {
        ctx += '▼ エンゲージメントパターン（これらを新しいキャプションに必ず適用してください）:\n';
        analysis.patterns.forEach((pattern, i) => {
            ctx += `  ${i + 1}. 「${pattern.name}」 (確信度: ${pattern.confidence}%)\n`;
            ctx += `     ${pattern.description}\n`;
            if (pattern.examples.length > 0) {
                ctx += `     例: ${pattern.examples.slice(0, 2).join(' / ')}\n`;
            }
        });
        ctx += '\n';
    }

    if (topPosts.length > 0) {
        ctx += '▼ 高パフォーマンスキャプション（トーンと構造のリファレンス）:\n';
        topPosts.slice(0, 3).forEach((p, i) => {
            ctx += `  参考${i + 1} (❤️${p.likes} 👁️${p.views}):\n`;
            ctx += `  """\n  ${p.caption}\n  """\n`;
        });
        ctx += '\n';
    }

    if (analysis.improvedCaptions.length > 0) {
        ctx += '▼ AIが改善提案したキャプション（スタイルの参考にしてください）:\n';
        analysis.improvedCaptions.slice(0, 2).forEach((ic, i) => {
            ctx += `  改善例${i + 1}: ${ic.improvedCaption.substring(0, 150)}...\n`;
            ctx += `  理由: ${ic.rationale}\n`;
        });
        ctx += '\n';
    }

    ctx += '【重要】上記のパターンとインサイトを活用して、同様のエンゲージメントが期待できるキャプションを生成してください。\n';

    return ctx;
}

function buildFallbackHistoryContext(
    topPosts: { caption: string | null; likes: number; views: number }[]
): string {
    if (topPosts.length === 0) return '';

    let ctx = `\n【過去の成功事例（参考用）】\n`;
    ctx += `以下のキャプションは過去の投稿で反応が良かったものです。トーンや構造の参考にしてください。\n`;
    topPosts.slice(0, 3).forEach((p, i) => {
        ctx += `事例${i + 1} (いいね:${p.likes}, 閲覧:${p.views}):\n"""\n${p.caption}\n"""\n`;
    });
    return ctx;
}
