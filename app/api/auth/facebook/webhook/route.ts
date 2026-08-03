import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { automationService } from '@/lib/services/automation.service'
import { rateLimit } from '@/lib/redis'

// Handle Facebook Webhook Verification
export async function GET(req: Request) {
    const url = new URL(req.url)
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')

    // Webhook verification token setup in Facebook App Dashboard -> Webhooks
    const verifyToken = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN
    
    if (!verifyToken) {
        console.error('[FacebookWebhook] FACEBOOK_WEBHOOK_VERIFY_TOKEN is missing in environment variables.')
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    if (mode === 'subscribe' && token === verifyToken) {
        console.log('[FacebookWebhook] Verification successful')
        return new NextResponse(challenge, { status: 200 })
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

export async function POST(req: Request) {
    try {
        // Rate limit: 200 requests per 60 seconds per IP
        const ip = req.headers.get('x-forwarded-for') || 'unknown-ip'
        const allowed = await rateLimit(`fb-webhook:${ip}`, 200, 60)
        
        if (!allowed) {
            console.warn(`[FacebookWebhook] Rate limit exceeded for IP: ${ip}`)
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
        }

        const facebookAppSecret = process.env.INSTAGRAM_APP_SECRET || process.env.FACEBOOK_APP_SECRET
        const arrayBuffer = await req.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const signature = req.headers.get('x-hub-signature-256')

        if (!signature || !facebookAppSecret) {
            console.warn('[FacebookWebhook] Missing signature or app secret')
            return NextResponse.json({ error: 'Missing signature or app secret' }, { status: 400 })
        }

        const expectedSignature = `sha256=${crypto
            .createHmac('sha256', facebookAppSecret)
            .update(buffer)
            .digest('hex')}`

        const signatureBuf = Buffer.from(signature)
        const expectedBuf = Buffer.from(expectedSignature)
        const signatureValid =
            signatureBuf.length === expectedBuf.length && crypto.timingSafeEqual(signatureBuf, expectedBuf)

        if (!signatureValid) {
            console.warn('[FacebookWebhook] Signature mismatch — verify INSTAGRAM_APP_SECRET matches Meta Dashboard')
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
        }

        const payload = JSON.parse(buffer.toString('utf8'))

        console.log('[FacebookWebhook] Webhook received:', payload.object, payload.entry?.length, 'entries')

        // Handle Instagram DM Events
        if (payload.object === 'instagram' && Array.isArray(payload.entry)) {
            for (const entry of payload.entry) {
                const igBusinessId = entry.id
                if (!igBusinessId) continue

                if (Array.isArray(entry.messaging)) {
                    for (const messagingEvent of entry.messaging) {
                        const senderId = messagingEvent.sender?.id
                        const message = messagingEvent.message

                        if (senderId && message && message.mid) {
                            try {
                                await automationService.handleDmEvent(igBusinessId, senderId, {
                                    mid: message.mid,
                                    text: message.text
                                })
                            } catch (dmErr) {
                                console.error('[FacebookWebhook] handleDmEvent failed:', dmErr)
                            }
                        }
                    }
                }
            }
        }

        // Handle Instagram Comment Events
        if (payload.object === 'instagram' && Array.isArray(payload.entry)) {
            for (const entry of payload.entry) {
                const igBusinessId = entry.id
                if (!igBusinessId) continue

                if (Array.isArray(entry.changes)) {
                    for (const change of entry.changes) {
                        if (change.field === 'comments') {
                            const value = change.value
                            const commentId = value.id
                            const fromId = value.from?.id
                            const text = value.text

                            console.log(`[FacebookWebhook] Extracted Comment from ${fromId}: "${text}"`)

                            // We only process new comments (not deletes, and maybe not from the page itself)
                            if (fromId && commentId && text) {
                                try {
                                    await automationService.handleCommentEvent(igBusinessId, fromId, {
                                        commentId,
                                        text,
                                        mediaId: value.media?.id
                                    })
                                } catch (cmtErr) {
                                    console.error('[FacebookWebhook] handleCommentEvent failed:', cmtErr)
                                }
                            }
                        }
                    }
                }
            }
        }

        return NextResponse.json({ success: true }, { status: 200 })

    } catch (e) {
        console.error('[FacebookWebhook] POST Error:', e)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

