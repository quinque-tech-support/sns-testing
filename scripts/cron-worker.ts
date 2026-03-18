import 'dotenv/config'

const CRON_SECRET = process.env.CRON_SECRET || 'test-secret'
const BASE_URL = process.env.NEXTAUTH_URL || 'https://sns-deployed.vercel.app'
const CRON_URL = `${BASE_URL}/api/cron?secret=${CRON_SECRET}`
const INTERVAL_MS = 60_000 // Run every 60 seconds

async function runCron(): Promise<void> {
    const timestamp = new Date().toLocaleTimeString()
    try {
        console.log(`\n[Worker] [${timestamp}] Triggering cron job...`)
        const res = await fetch(CRON_URL)
        const json = await res.json()
        if (res.ok) {
            console.log(`[Worker] ✅ Success: ${json.message}`)
            if (json.publishedResults?.length > 0) {
                for (const r of json.publishedResults) {
                    if (r.success) {
                        console.log(`  → Published post, IG Media ID: ${r.mediaId}`)
                    } else {
                        console.warn(`  → Failed to publish schedule ${r.scheduleId}: ${r.error}`)
                    }
                }
            }
        } else {
            console.error(`[Worker] ❌ Cron failed (${res.status}): ${json.error || json.message}`)
        }
    } catch (err: any) {
        console.error(`[Worker] ❌ Network error: ${err.message}`)
        console.error('[Worker] Is the Next.js dev server running? (npm run dev)')
    }
}

async function main() {
    console.log('============================================')
    console.log('  Schedlify – Continuous Background Worker')
    console.log('============================================')
    console.log(`  Cron URL   : ${CRON_URL}`)
    console.log(`  Interval   : every ${INTERVAL_MS / 1000}s`)
    console.log('  Press CTRL+C to stop.')
    console.log('--------------------------------------------\n')

    // Run immediately on start
    await runCron()

    // Then repeatedly
    setInterval(runCron, INTERVAL_MS)
}

main()
