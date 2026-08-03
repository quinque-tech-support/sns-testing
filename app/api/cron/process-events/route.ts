import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { automationService } from '@/lib/services/automation.service'

// This endpoint is called by a cron job (e.g. Vercel Cron) to process
// pending automation events (DM replies) that are past their scheduled time.
// Set CRON_SECRET in your environment variables and pass it via the
// `x-cron-secret` header (not a query string, which leaks into access/proxy
// logs and Referer headers).
function isValidSecret(provided: string | null, expected: string | undefined): boolean {
    if (!provided || !expected) return false
    const providedBuf = Buffer.from(provided)
    const expectedBuf = Buffer.from(expected)
    if (providedBuf.length !== expectedBuf.length) return false
    return timingSafeEqual(providedBuf, expectedBuf)
}

export async function GET(req: Request) {
    const secret = req.headers.get('x-cron-secret')
    const cronSecret = process.env.CRON_SECRET

    if (!isValidSecret(secret, cronSecret)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        console.log('[CronProcess] Starting processDueEvents...')
        const result = await automationService.processDueEvents()
        console.log('[CronProcess] Done:', result)

        return NextResponse.json({
            success: true,
            processed: result.dmReplies,
            failed: result.failed
        })
    } catch (e) {
        console.error('[CronProcess] Error:', e)
        return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
    }
}
