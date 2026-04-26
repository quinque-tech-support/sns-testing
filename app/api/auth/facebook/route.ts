import { NextRequest, NextResponse } from 'next/server'
import { facebookService } from '@/lib/services/facebook.service'
import { requirePageAuth } from '@/lib/auth.utils'

export async function GET(request: NextRequest) {
    const session = await requirePageAuth();
    const userId = session.user.id;

    

    // Pass the user ID as state to verify on callback
    const state = Buffer.from(JSON.stringify({ userId: userId })).toString('base64')

    // Determine the dynamic redirect URI based on the request origin
    const origin = request.nextUrl.origin
    const redirectUri = `${origin}/api/auth/facebook/callback`

    const authUrl = facebookService.generateAuthUrl(state, redirectUri)

    return NextResponse.redirect(authUrl)
}
