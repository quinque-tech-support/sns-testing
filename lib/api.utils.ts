import { NextResponse } from 'next/server'

/**
 * Standardized API error response helper.
 * Use this in all route handlers instead of inline NextResponse.json({ error }).
 */
export function apiError(message: string, status = 500): NextResponse {
    return NextResponse.json({ error: message }, { status })
}

/**
 * Standardized API success response helper.
 */
export function apiSuccess<T>(data: T, status = 200): NextResponse {
    return NextResponse.json(data, { status })
}

/**
 * Extract a safe error message from an unknown catch value.
 */
export function toErrorMessage(e: unknown): string {
    if (e instanceof Error) return e.message
    if (typeof e === 'string') return e
    return 'Unknown error'
}
