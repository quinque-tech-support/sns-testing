import { NextRequest, NextResponse } from 'next/server'
import { facebookService } from '@/lib/facebook.service'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    if (error) {
        console.error('Facebook Auth Error:', error)
        return NextResponse.redirect(new URL('/account?error=auth_denied', appUrl))
    }

    if (!code || !state) {
        return NextResponse.redirect(new URL('/account?error=invalid_callback', appUrl))
    }

    try {
        // 1. Decode state to verify user
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString('ascii'))
        const userId = stateData.userId

        if (!userId) {
            throw new Error('Invalid state identifier')
        }

        // 2. Exchange code for short-lived token
        const shortLivedToken = await facebookService.exchangeCodeForToken(code)

        // 3. Exchange for long-lived token
        const longLivedResponse = await facebookService.exchangeForLongLivedToken(shortLivedToken)
        const longLivedToken = longLivedResponse.access_token

        // Calculate exact expiry date (default 60 days if expires_in is missing)
        const expiresIn = longLivedResponse.expires_in || (60 * 24 * 60 * 60)
        const tokenExpiry = new Date(Date.now() + (expiresIn * 1000))

        // 4. Get User Profile for ID
        const fbProfile = await facebookService.getUserProfile(longLivedToken)

        // 5. Get Facebook Pages
        const pages = await facebookService.getUserPages(longLivedToken)

        if (!pages || pages.length === 0) {
            return NextResponse.redirect(new URL('/account?error=no_pages_found', appUrl))
        }

        let connectedCount = 0

        // 6. Iterate through pages to find linked IG accounts
        for (const page of pages) {
            try {
                const igAccount = await facebookService.getInstagramBusinessAccount(page.id, page.access_token)

                if (igAccount && igAccount.id) {
                    // 7. Store in Database
                    await prisma.connectedAccount.upsert({
                        where: {
                            userId_pageId: {
                                userId: userId,
                                pageId: page.id
                            }
                        },
                        update: {
                            instagramBusinessId: igAccount.id,
                            username: igAccount.username || page.name,
                            profilePictureUrl: igAccount.profile_picture_url,
                            pageAccessToken: page.access_token, // Store the page token for IG API calls
                            longLivedUserToken: longLivedToken,
                            tokenExpiry: tokenExpiry,
                            facebookUserId: fbProfile.id,
                        },
                        create: {
                            userId: userId,
                            facebookUserId: fbProfile.id,
                            pageId: page.id,
                            instagramBusinessId: igAccount.id,
                            username: igAccount.username || page.name,
                            profilePictureUrl: igAccount.profile_picture_url,
                            pageAccessToken: page.access_token,
                            longLivedUserToken: longLivedToken,
                            tokenExpiry: tokenExpiry,
                        }
                    })
                    connectedCount++
                }
            } catch (pageError) {
                console.warn(`Failed to process page ${page.id}:`, pageError)
                // Continue to next page
            }
        }

        if (connectedCount === 0) {
            return NextResponse.redirect(new URL('/account?error=no_ig_business_found', appUrl))
        }

        return NextResponse.redirect(new URL('/account?success=true', appUrl))

    } catch (error: any) {
        console.error('Callback processing error:', error)
        return NextResponse.redirect(new URL('/account?error=processing_failed', appUrl))
    }
}