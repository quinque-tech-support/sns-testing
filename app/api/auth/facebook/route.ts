import { NextResponse } from 'next/server'

// Route: GET /api/auth/facebook
export async function GET() {
    const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID || process.env.FACEBOOK_APP_ID
    const FACEBOOK_REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI

    if (!FACEBOOK_APP_ID || !FACEBOOK_REDIRECT_URI) {
        console.error('[OAuth] Missing FACEBOOK_APP_ID or FACEBOOK_REDIRECT_URI')
        return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
    }

    const scopes = [
        'pages_show_list',
        'pages_read_engagement',
        'instagram_basic',
        'instagram_content_publish',
        'business_management'
    ].join(',')

    const url = new URL('https://www.facebook.com/v19.0/dialog/oauth')
    url.searchParams.append('client_id', FACEBOOK_APP_ID)
    url.searchParams.append('redirect_uri', FACEBOOK_REDIRECT_URI)
    url.searchParams.append('scope', scopes)
    url.searchParams.append('response_type', 'code')

    // Redirect to Facebook OAuth dialog
    return NextResponse.redirect(url.toString())
}
