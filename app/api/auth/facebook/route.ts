import { NextRequest, NextResponse } from 'next/server'
import { facebookService } from '@/lib/services/facebook.service'
import { requirePageAuth } from '@/lib/auth.utils'
import { createOAuthState } from '@/lib/oauth-state'

export async function GET(request: NextRequest) {
    const session = await requirePageAuth();
    const userId = session.user.id;

    // Signed, expiring state — proves the callback wasn't forged by a third party.
    // The callback still re-resolves identity from the live session before acting.
    const state = createOAuthState(userId)

    // Determine the dynamic redirect URI based on the request origin
    const origin = request.nextUrl.origin
    const redirectUri = `${origin}/api/auth/facebook/callback`

    const authUrl = facebookService.generateAuthUrl(state, redirectUri)

    return NextResponse.redirect(authUrl)
}
