import { NextRequest, NextResponse } from 'next/server'
import { facebookService } from '@/lib/facebook.service'
import { auth } from '@/auth'

export async function GET(request: NextRequest) {
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.redirect(new URL('/signin', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'))
    }

    // Pass the user ID as state to verify on callback
    const state = Buffer.from(JSON.stringify({ userId: session.user.id })).toString('base64')

    // Determine the dynamic redirect URI based on the request origin
    const origin = request.nextUrl.origin
    const redirectUri = `${origin}/api/auth/facebook/callback`

    const authUrl = facebookService.generateAuthUrl(state, redirectUri)

    return NextResponse.redirect(authUrl)
}
