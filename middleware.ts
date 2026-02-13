import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth(async (req) => {
    const session = req.auth

    // Protect routes that start with /dashboard
    if (req.nextUrl.pathname.startsWith('/dashboard')) {
        if (!session) {
            return NextResponse.redirect(new URL('/signin', req.url))
        }
    }

    return NextResponse.next()
})

export const config = {
    matcher: ['/dashboard/:path*']
}
