import type {
    PipelineInput,
    PipelineOutput,
    FusedContext,
    CaptionResult,
    ImageAnalysis,
    CriticScore,
} from '../types';
import { MAX_IMAGES } from '../types';
import { analyzeImage } from '../vision/analyzeImage';
import { detectPostType, selectAnchorImage, interpretSequence } from '../sequence/interpretSequence';
import { runStrategist } from '../strategist/strategist';
import { analyzePatterns } from '../pattern/analyzer';
import { runWriter } from '../writer/writer';
import { runCritic } from '../critic/critic';
import { runRefiner } from '../refiner/refiner';
import { sleep, staggeredDelay } from '../utils/retry';

// Re-import constants as values (not types)
const MAX_ITERATIONS = 2;
const SCORE_THRESHOLD = 8;

/**
 * Main pipeline orchestrator.
 *
 * Flow:
 *  1. Analyze all images (parallel, staggered)
 *  2. Detect post type
 *  3. Select anchor image
 *  4. If multi-image → run sequence interpreter
 *  5. Run pattern analyzer on past captions (mandatory)
 *  6. Fuse all context
 *  7. Run strategist (once)
 *  8. For each variation in strategy.variation_plan:
 *     Writer → Critic → Refiner (max 2 iterations)
 *  9. Rank by score
 * 10. Return single best caption
 */
export async function generateCaptions(input: PipelineInput): Promise<PipelineOutput> {
    const startTime = Date.now();
    const { apiKey } = input;

    console.log('═══════════════════════════════════════');
    console.log('[Pipeline] Starting multi-stage caption generation');
    console.log(`[Pipeline] Images: ${input.images.length}, Project: ${input.projectContext?.title || 'none'}, Prompt: ${input.userPrompt ? 'yes' : 'no'}`);
    console.log('═══════════════════════════════════════');

    // ── 1. VISION ANALYSIS — analyze all images ─────────────────────────
    const imagesToAnalyze = input.images.slice(0, MAX_IMAGES);
    let allAnalyses: ImageAnalysis[] = [];

    if (imagesToAnalyze.length > 0) {
        console.log(`[Pipeline] Stage 1: Analyzing ${imagesToAnalyze.length} image(s)...`);

        // Staggered parallel — avoid burst rate limits
        const analysisPromises = imagesToAnalyze.map(async (img, i) => {
            if (i > 0) await sleep(staggeredDelay(i));
            return analyzeImage(img, apiKey);
        });

        const results = await Promise.allSettled(analysisPromises);
        allAnalyses = results
            .filter((r): r is PromiseFulfilledResult<ImageAnalysis> => r.status === 'fulfilled')
            .map(r => r.value);

        // Log any failures
        results
            .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
            .forEach((r, i) => console.error(`[Pipeline] Vision analysis failed for image ${i}:`, r.reason?.message));

        if (allAnalyses.length === 0) {
            // Fallback: create a minimal analysis so pipeline can continue
            console.warn('[Pipeline] All vision analyses failed — using minimal fallback');
            allAnalyses = [{
                objects: [],
                scene: 'unknown',
                mood: 'neutral',
                actions: [],
                primary_subject: 'image content',
                confidence: 0.2,
            }];
        }
    } else {
        // No images — text-only generation
        allAnalyses = [{
            objects: [],
            scene: 'no image provided',
            mood: 'neutral',
            actions: [],
            primary_subject: 'text-only post',
            confidence: 0.1,
        }];
    }

    // ── 2. POST TYPE DETECTION ──────────────────────────────────────────
    const postType = detectPostType(imagesToAnalyze.length);
    console.log(`[Pipeline] Stage 2: Post type = "${postType}"`);

    // ── 3. ANCHOR IMAGE SELECTION ───────────────────────────────────────
    const { anchor: anchorAnalysis } = selectAnchorImage(allAnalyses);
    console.log(`[Pipeline] Stage 3: Anchor = "${anchorAnalysis.primary_subject}"`);

    // ── 4. SEQUENCE INTERPRETATION (multi-image only) ───────────────────
    let sequenceData = undefined;
    if (postType !== 'single' && allAnalyses.length > 1) {
        console.log('[Pipeline] Stage 4: Running sequence interpreter...');
        try {
            sequenceData = await interpretSequence(allAnalyses, apiKey);
        } catch (err: any) {
            console.warn('[Pipeline] Sequence interpretation failed (non-fatal):', err.message);
        }
    }

    // ── 5. PATTERN ANALYSIS (mandatory) ─────────────────────────────────
    console.log('[Pipeline] Stage 5: Running pattern analysis...');
    let patternData = undefined;
    const pastCaptions = input.pastCaptions?.filter(c => c && c.trim().length > 0) || [];

    try {
        patternData = await analyzePatterns(pastCaptions, apiKey);
    } catch (err: any) {
        console.warn('[Pipeline] Pattern analysis failed (non-fatal):', err.message);
    }

    // ── 6. FUSE CONTEXT ─────────────────────────────────────────────────
    const visionSummary = allAnalyses.map((a, i) =>
        `Image ${i + 1}: ${a.primary_subject} (${a.scene}, ${a.mood})`
    ).join('; ');

    const fusedContext: FusedContext = {
        userPrompt: input.userPrompt,
        currentCaption: input.currentCaption,
        projectContext: input.projectContext,
        analysisContextStr: input.analysisContextStr,
        visionSummary,
        sequenceData,
        patternData,
        postType,
        anchorAnalysis,
        allAnalyses,
    };

    console.log('[Pipeline] Stage 6: Context fused');

    // ── 7. STRATEGIST (runs once) ───────────────────────────────────────
    console.log('[Pipeline] Stage 7: Running strategist...');
    const strategy = await runStrategist(fusedContext, apiKey);

    // ── 8. GENERATION LOOP — Writer → Critic → Refiner per variation ───
    console.log(`[Pipeline] Stage 8: Generating ${strategy.variation_plan.length} variations...`);

    const variationResults: CaptionResult[] = [];

    // Run variations sequentially to respect rate limits
    for (let v = 0; v < strategy.variation_plan.length; v++) {
        const variationType = strategy.variation_plan[v];

        // Stagger between variations
        if (v > 0) await sleep(staggeredDelay(v));

        try {
            const result = await runSingleVariation(
                strategy,
                fusedContext,
                variationType,
                apiKey
            );
            variationResults.push(result);
        } catch (err: any) {
            console.error(`[Pipeline] Variation "${variationType}" failed:`, err.message);
        }
    }

    if (variationResults.length === 0) {
        throw new Error('[Pipeline] All caption variations failed. No captions generated.');
    }

    // ── 9. RANK & SELECT BEST ───────────────────────────────────────────
    variationResults.sort((a, b) => b.score - a.score);

    const bestCaption = variationResults[0];
    console.log('═══════════════════════════════════════');
    console.log(`[Pipeline] COMPLETE in ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
    console.log(`[Pipeline] Best caption: "${bestCaption.style}" style, score: ${bestCaption.score}/10`);
    console.log(`[Pipeline] All scores: ${variationResults.map(r => `${r.style}=${r.score}`).join(', ')}`);
    console.log('═══════════════════════════════════════');

    return {
        caption: bestCaption,
        strategist_summary: strategy,
    };
}

/**
 * Run a single Writer → Critic → Refiner loop for one variation style.
 */
async function runSingleVariation(
    strategy: any,
    ctx: FusedContext,
    variationType: string,
    apiKey: string
): Promise<CaptionResult> {
    console.log(`\n[Variation "${variationType}"] Starting...`);

    // Writer
    let draft = await runWriter(strategy, ctx, variationType, apiKey);
    let criticResult: CriticScore | null = null;
    let iterations = 0;

    // Critic → Refiner loop (max 2 iterations)
    while (iterations < MAX_ITERATIONS) {
        iterations++;

        // Small delay between writer/critic/refiner calls
        await sleep(500);

        // Critic
        criticResult = await runCritic(strategy, draft, ctx, apiKey);

        if (criticResult.total >= SCORE_THRESHOLD) {
            console.log(`[Variation "${variationType}"] Score ${criticResult.total}/10 >= ${SCORE_THRESHOLD} — accepted after ${iterations} iteration(s)`);
            break;
        }

        if (iterations >= MAX_ITERATIONS) {
            console.log(`[Variation "${variationType}"] Max iterations reached with score ${criticResult.total}/10`);
            break;
        }

        // Refiner
        await sleep(500);
        draft = await runRefiner(strategy, draft, criticResult, ctx, apiKey);
    }

    // Final score — if critic didn't run (shouldn't happen), default to 5
    const finalScore = criticResult?.total ?? 5;

    return {
        text: draft.caption,
        score: finalScore,
        style: variationType,
        hashtags: draft.hashtags,
        rationale: `Score: ${finalScore}/10 after ${iterations} iteration(s). Style: ${variationType}. ${criticResult?.suggestions?.[0] || ''}`,
    };
}
