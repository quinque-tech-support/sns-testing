import crypto from 'crypto'

const STATE_TTL_MS = 10 * 60 * 1000 // 10 minutes

function getSecret(): string {
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
    if (!secret) {
        throw new Error('AUTH_SECRET or NEXTAUTH_SECRET must be set to sign OAuth state')
    }
    return secret
}

function sign(payload: string): string {
    return crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url')
}

/**
 * Produces a tamper-evident, expiring OAuth `state` value bound to userId.
 * The callback must still resolve identity from the live session, not from
 * this payload, since `state` only proves it wasn't forged by a third party.
 */
export function createOAuthState(userId: string): string {
    const payload = JSON.stringify({ userId, issuedAt: Date.now() })
    const encodedPayload = Buffer.from(payload).toString('base64url')
    const signature = sign(encodedPayload)
    return `${encodedPayload}.${signature}`
}

export function verifyOAuthState(state: string): { userId: string } {
    const [encodedPayload, signature] = state.split('.')
    if (!encodedPayload || !signature) {
        throw new Error('Malformed state')
    }

    const expectedSignature = sign(encodedPayload)
    const sigBuf = Buffer.from(signature)
    const expectedBuf = Buffer.from(expectedSignature)
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
        throw new Error('Invalid state signature')
    }

    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'))
    if (!payload.userId || typeof payload.issuedAt !== 'number') {
        throw new Error('Invalid state payload')
    }

    if (Date.now() - payload.issuedAt > STATE_TTL_MS) {
        throw new Error('Expired state')
    }

    return { userId: payload.userId }
}
