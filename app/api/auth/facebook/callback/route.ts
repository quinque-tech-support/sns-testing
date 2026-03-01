import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { facebookService, FacebookApiError } from '@/lib/facebook.service'

const getRedirectUrl = (baseUrl: string, error?: string, success?: boolean) => {
    const url = new URL('/account', baseUrl)
    if (error) {
        url.searchParams.set('error', error)
    }
    if (success) {
        url.searchParams.set('success', 'true')
    }
    return url.toString()
}

// Route: GET /api/auth/facebook/callback
export async function GET(req: Request) {
    const reqUrl = req.url
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.redirect(getRedirectUrl(reqUrl, 'Unauthorized'))
        }

        const url = new URL(req.url)
        const code = url.searchParams.get('code')
        const error = url.searchParams.get('error')

        if (error) {
            console.error('[FacebookCallback] Permission denied or OAuth error:', url.searchParams.get('error_description') || error)
            return NextResponse.redirect(getRedirectUrl(reqUrl, `Facebook error: ${url.searchParams.get('error_description') || error}`))
        }

        if (!code) {
            return NextResponse.redirect(getRedirectUrl(reqUrl, 'OAuth code missing'))
        }

        // 1. Exchange code for short-lived token
        let shortLivedToken: string
        try {
            shortLivedToken = await facebookService.exchangeCodeForToken(code)
        } catch (e: any) {
            return NextResponse.redirect(getRedirectUrl(reqUrl, e instanceof FacebookApiError ? e.message : 'Failed to exchange authorization code'))
        }

        // 2. Exchange short-lived token for long-lived user token
        let longLivedData
        try {
            longLivedData = await facebookService.exchangeForLongLivedToken(shortLivedToken)
        } catch (e: any) {
            return NextResponse.redirect(getRedirectUrl(reqUrl, e instanceof FacebookApiError ? e.message : 'Failed to obtain long-lived token'))
        }

        const longLivedUserToken = longLivedData.access_token
        // Expiry date (expires_in is typically returned in seconds)
        const tokenExpiry = new Date(Date.now() + (longLivedData.expires_in || 60 * 24 * 60 * 60) * 1000)

        // 3. Fetch User profile (/me) to get facebook_user_id
        let userProfile
        try {
            userProfile = await facebookService.getUserProfile(longLivedUserToken)
        } catch (e: any) {
            return NextResponse.redirect(getRedirectUrl(reqUrl, e instanceof FacebookApiError ? e.message : 'Failed to retrieve Facebook User Profile'))
        }

        if (!userProfile?.id) {
            return NextResponse.redirect(getRedirectUrl(reqUrl, 'Failed to retrieve Facebook User Profile ID'))
        }
        const facebookUserId = userProfile.id

        // Check if user has already linked a different Facebook account
        const existingOtherFbAccount = await prisma.connectedAccount.findFirst({
            where: {
                userId: session.user.id,
                facebookUserId: { not: facebookUserId },
            }
        })

        if (existingOtherFbAccount) {
            return NextResponse.redirect(getRedirectUrl(reqUrl, 'Please log in with the originally connected Facebook account. You cannot link multiple Facebook accounts to the same profile.'))
        }

        // 4. Fetch /me/accounts to get Pages
        let pages
        try {
            pages = await facebookService.getUserPages(longLivedUserToken)
        } catch (e: any) {
            return NextResponse.redirect(getRedirectUrl(reqUrl, e instanceof FacebookApiError ? e.message : 'Failed to retrieve Facebook pages'))
        }

        if (!pages || pages.length === 0) {
            return NextResponse.redirect(getRedirectUrl(reqUrl, 'No Facebook pages found for this user.'))
        }

        let savedCount = 0
        let errors: string[] = []

        // 5. For each page, attempt to find instagram_business_account
        for (const page of pages) {
            try {
                // Check if page already connected by another user
                const existingPageOtherUser = await prisma.connectedAccount.findFirst({
                    where: {
                        pageId: page.id,
                        userId: { not: session.user.id }
                    }
                })

                if (existingPageOtherUser) {
                    errors.push(`Page "${page.name}" is already linked by another user.`)
                    continue
                }

                // Check if it's already connected by this user
                const existingPageSameUser = await prisma.connectedAccount.findUnique({
                    where: {
                        userId_pageId: {
                            userId: session.user.id,
                            pageId: page.id
                        }
                    }
                })

                if (existingPageSameUser) {
                    errors.push(`Page "${page.name}" is already connected.`)
                    continue
                }

                const instagramBusinessId = await facebookService.getInstagramBusinessAccount(page.id, page.access_token)

                if (!instagramBusinessId) {
                    errors.push(`Page "${page.name}" does not have a linked Instagram Business Account, or permissions are missing.`)
                    continue
                }

                await prisma.connectedAccount.upsert({
                    where: {
                        userId_pageId: {
                            userId: session.user.id,
                            pageId: page.id
                        }
                    },
                    update: {
                        facebookUserId,
                        instagramBusinessId,
                        pageAccessToken: page.access_token,
                        longLivedUserToken,
                        tokenExpiry,
                    },
                    create: {
                        userId: session.user.id,
                        facebookUserId,
                        pageId: page.id,
                        instagramBusinessId,
                        pageAccessToken: page.access_token,
                        longLivedUserToken,
                        tokenExpiry,
                    }
                })

                savedCount++
            } catch (pageError: any) {
                if (pageError instanceof FacebookApiError) {
                    errors.push(`Error for page "${page.name}": ${pageError.message}`)
                } else {
                    errors.push(`Unknown error checking page "${page.name}"`)
                }
            }
        }

        if (savedCount === 0) {
            const errorMsg = errors.length > 0 ? errors[0] : 'No valid Instagram Business accounts found.'
            return NextResponse.redirect(getRedirectUrl(reqUrl, errorMsg))
        }

        // Successfully linked
        return NextResponse.redirect(getRedirectUrl(reqUrl, undefined, true))

    } catch (error: any) {
        console.error('[FacebookCallback] General Error:', error)
        return NextResponse.redirect(getRedirectUrl(reqUrl, 'Internal Server Error during token processing'))
    }
}
