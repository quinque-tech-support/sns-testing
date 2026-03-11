import { NextResponse } from 'next/server'
import { facebookService } from '@/lib/facebook.service'
import { auth } from '@/auth'

export async function GET() {
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.redirect(new URL('/signin', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'))
    }

    // Pass the user ID as state to verify on callback
    const state = Buffer.from(JSON.stringify({ userId: session.user.id })).toString('base64')

    const authUrl = facebookService.generateAuthUrl(state)

    return NextResponse.redirect(authUrl)
}
