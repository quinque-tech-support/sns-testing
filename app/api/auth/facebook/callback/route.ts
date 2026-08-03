import { NextRequest, NextResponse } from 'next/server'
import { AccountService } from '@/lib/services/account.service'
import { verifyOAuthState } from '@/lib/oauth-state'
import { auth } from '@/auth'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    const appUrl = request.nextUrl.origin

    if (error) {
        console.error('Facebook Auth Error:', error)
        return NextResponse.redirect(new URL('/account?error=auth_denied', appUrl))
    }

    if (!code || !state) {
        return NextResponse.redirect(new URL('/account?error=invalid_callback', appUrl))
    }

    try {
        // 1. Verify state wasn't forged/tampered/replayed
        const stateData = verifyOAuthState(state)

        // 2. Identity comes from the live session, never from the state payload —
        // state only proves this callback was legitimately initiated, not who's calling.
        const session = await auth()
        if (!session?.user?.id || session.user.id !== stateData.userId) {
            throw new Error('Session does not match OAuth state initiator')
        }
        const userId = session.user.id

        const redirectUri = `${appUrl}/api/auth/facebook/callback`

        // 3. Delegate to Service Layer
        await AccountService.processFacebookCallback(userId, code, redirectUri)

        return NextResponse.redirect(new URL('/account?success=true', appUrl))

    } catch (error: any) {
        console.error('Callback processing error:', error)

        const errorMessage = error.message
        if (['no_pages_found', 'no_ig_business_found'].includes(errorMessage)) {
            return NextResponse.redirect(new URL(`/account?error=${errorMessage}`, appUrl))
        }

        return NextResponse.redirect(new URL('/account?error=processing_failed', appUrl))
    }
}