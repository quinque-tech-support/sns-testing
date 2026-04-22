/**
 * Retry utility with exponential backoff, jitter, and rate-limit awareness.
 * Handles Gemini 429 / 503 errors and parses explicit retry-after headers.
 */

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BASE_DELAY_MS = 2000;
const STAGGER_INTERVAL_MS = 1500;

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate a staggered delay for parallel requests to avoid burst rate limits.
 */
export function staggeredDelay(index: number): number {
    return index * STAGGER_INTERVAL_MS;
}

/**
 * Check if an error is retryable (rate limit or server error).
 */
function isRetryableError(error: any): boolean {
    const status = error?.status;
    if (status === 429 || status === 503) return true;

    const msg = String(error);
    if (msg.includes('429') || msg.includes('503')) return true;
    if (error instanceof SyntaxError) return true; // JSON parse intermittent failures

    return false;
}

/**
 * Extract explicit wait time from Google API 429 error messages.
 * Example: "Please retry in 12.5s"
 */
function parseRetryAfter(error: any): number | null {
    const msg = String(error);
    const match = msg.match(/Please retry in (\d+\.?\d*)s/);
    if (match?.[1]) {
        return parseFloat(match[1]) * 1000 + 1000; // exact time + 1s buffer
    }
    return null;
}

/**
 * Execute an async function with retry logic.
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    options?: {
        maxRetries?: number;
        baseDelayMs?: number;
        label?: string;
    }
): Promise<T> {
    const maxRetries = options?.maxRetries ?? DEFAULT_MAX_RETRIES;
    const baseDelay = options?.baseDelayMs ?? DEFAULT_BASE_DELAY_MS;
    const label = options?.label ?? 'API call';

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;

            if (!isRetryableError(error) || attempt >= maxRetries) {
                throw error;
            }

            // Calculate delay: explicit retry-after OR exponential backoff with jitter
            const retryAfter = parseRetryAfter(error);
            const delay = retryAfter ?? (baseDelay * Math.pow(2, attempt) + Math.random() * 1000);

            console.warn(
                `[Retry] ${label} — attempt ${attempt + 1}/${maxRetries + 1} failed (${error?.status || error?.name || 'error'}). ` +
                `Retrying in ${Math.round(delay)}ms...`
            );

            await sleep(delay);
        }
    }

    throw lastError ?? new Error(`${label} failed after ${maxRetries + 1} attempts`);
}
