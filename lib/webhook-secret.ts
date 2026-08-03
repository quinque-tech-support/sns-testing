/**
 * Shared secret for internal worker -> webhook callbacks (e.g. image generation).
 * Throws instead of falling back to a known literal, so a misconfigured
 * environment fails loudly rather than accepting forged webhook calls.
 */
export function getWebhookSecret(): string {
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
    if (!secret) {
        throw new Error('AUTH_SECRET or NEXTAUTH_SECRET must be set to sign/verify internal webhook calls')
    }
    return secret
}
