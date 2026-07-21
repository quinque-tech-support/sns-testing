import axios from 'axios'
import { IG_GRAPH_BASE } from '@/lib/constants'
import { getCached } from '@/lib/redis'
import crypto from 'crypto'

export class FacebookApiError extends Error {
    constructor(
        public message: string,
        public code?: number,
        public subcode?: number,
        public fbType?: string,
        public userMessage?: string
    ) {
        super(message)
        this.name = 'FacebookApiError'
    }
}

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID!
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET

const graphApi = axios.create({
    baseURL: IG_GRAPH_BASE,
})

export interface AccessTokenResponse {
    access_token: string
    token_type: string
    expires_in: number
}

export interface FacebookProfile {
    id: string
    name: string
}

export interface FacebookPage {
    id: string
    name: string
    access_token: string
}

export interface InstagramBusinessAccount {
    id: string
    username?: string
    profile_picture_url?: string
}

export const facebookService = {
    /**
     * Generate the Facebook OAuth Login URL
     */
    generateAuthUrl(state: string, redirectUri: string): string {
        const params = new URLSearchParams({
            client_id: FACEBOOK_APP_ID,
            redirect_uri: redirectUri,
            state: state,
            scope: 'pages_show_list,pages_read_engagement,instagram_basic,instagram_content_publish,business_management,instagram_manage_messages,instagram_manage_insights',
            response_type: 'code',
        })
        return `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`
    },
    /**
     * Exchange the short-lived authorization code for a short-lived access token
     */
    async exchangeCodeForToken(code: string, redirectUri: string): Promise<string> {
        try {
            const response = await axios.get<AccessTokenResponse>(`${IG_GRAPH_BASE}/oauth/access_token`, {
                params: {
                    client_id: FACEBOOK_APP_ID,
                    client_secret: FACEBOOK_APP_SECRET,
                    redirect_uri: redirectUri,
                    code,
                }
            })
            return response.data.access_token
        } catch (error: any) {
            console.error('[FacebookService] Failed to exchange code for token:', error.response?.data || error.message)
            const fbError = error.response?.data?.error
            throw new FacebookApiError(
                fbError?.message || 'Token exchange failure',
                fbError?.code,
                fbError?.error_subcode,
                fbError?.type,
                fbError?.error_user_msg
            )
        }
    },

    /**
     * Exchange a short-lived user token for a long-lived user token (valid ~60 days)
     * Production token refresh strategy:
     * This long-lived token should be saved and can be refreshed natively by keeping the session active,
     * or a background worker can prompt the user for re-authentication if it expires.
     */
    async exchangeForLongLivedToken(shortLivedToken: string): Promise<AccessTokenResponse> {
        try {
            const response = await axios.get<AccessTokenResponse>(`${IG_GRAPH_BASE}/oauth/access_token`, {
                params: {
                    grant_type: 'fb_exchange_token',
                    client_id: FACEBOOK_APP_ID,
                    client_secret: FACEBOOK_APP_SECRET,
                    fb_exchange_token: shortLivedToken,
                }
            })
            return response.data
        } catch (error: any) {
            console.error('[FacebookService] Failed to exchange for long-lived token:', error.response?.data || error.message)
            const fbError = error.response?.data?.error
            throw new FacebookApiError(
                fbError?.message || 'Long-lived token exchange failure',
                fbError?.code,
                fbError?.error_subcode,
                fbError?.type,
                fbError?.error_user_msg
            )
        }
    },

    /**
     * Fetch the user's base Meta profile (ID and Name)
     */
    async getUserProfile(accessToken: string): Promise<FacebookProfile> {
        const tokenHash = crypto.createHash('sha256').update(accessToken).digest('hex').substring(0, 16)
        return getCached(`meta:userProfile:${tokenHash}`, async () => {
            try {
                const response = await graphApi.get<FacebookProfile>('/me', {
                    params: {
                        access_token: accessToken,
                    }
                })
                return response.data
            } catch (error: any) {
                console.error('[FacebookService] Failed to fetch user profile:', error.response?.data || error.message)
                const fbError = error.response?.data?.error
                throw new FacebookApiError(
                    fbError?.message || 'Failed to fetch user profile',
                    fbError?.code,
                    fbError?.error_subcode,
                    fbError?.type,
                    fbError?.error_user_msg
                )
            }
        }, 600) // Cache for 10 minutes
    },

    /**
     * Fetch all pages the user manages
     */
    async getUserPages(accessToken: string): Promise<FacebookPage[]> {
        const tokenHash = crypto.createHash('sha256').update(accessToken).digest('hex').substring(0, 16)
        return getCached(`meta:userPages:${tokenHash}`, async () => {
            try {
                const response = await graphApi.get('/me/accounts', {
                    params: {
                        access_token: accessToken,
                    }
                })
                return response.data.data as FacebookPage[]
            } catch (error: any) {
                console.error('[FacebookService] Failed to fetch user pages:', error.response?.data || error.message)
                const fbError = error.response?.data?.error
                throw new FacebookApiError(
                    fbError?.message || 'Failed to fetch user pages',
                    fbError?.code,
                    fbError?.error_subcode,
                    fbError?.type,
                    fbError?.error_user_msg
                )
            }
        }, 600) // Cache for 10 minutes
    },

    /**
     * Fetch the Instagram Business Account ID associated with a given Page
     */
    async getInstagramBusinessAccount(pageId: string, pageAccessToken: string): Promise<InstagramBusinessAccount | null> {
        return getCached(`meta:igAccount:${pageId}`, async () => {
            try {
                const response = await graphApi.get(`/${pageId}`, {
                    params: {
                        fields: 'instagram_business_account{id,username,profile_picture_url}',
                        access_token: pageAccessToken,
                    }
                })

                if (response.data.instagram_business_account) {
                    return response.data.instagram_business_account
                }
                return null
            } catch (error: any) {
                console.error(`[FacebookService] Failed to check IG Business Account for page ${pageId}:`, error.response?.data || error.message)
                const fbError = error.response?.data?.error
                if (fbError && (fbError.code === 10 || fbError.code === 190)) {
                    // Return null if lacking permissions (e.g. app not approved for IG basic, or just permission denied)
                    return null
                }
                // For rate limits, we should probably throw it so the top level catches it
                if (fbError && (fbError.code === 4 || fbError.code === 17 || fbError.code === 32 || fbError.code === 613)) {
                    throw new FacebookApiError(
                        fbError.message || 'Rate limit exceeded',
                        fbError.code,
                        fbError.error_subcode,
                        fbError.type,
                        fbError.error_user_msg
                    )
                }
                // If permission denied or missing, return null rather than crashing the whole flow
                return null
            }
        }, 600) // Cache for 10 minutes
    },

    /**
     * Fetch insights for a published IG Media.
     */
    async getMediaInsights(mediaId: string, accessToken: string): Promise<{ views: number, reach: number, saves: number, likes: number } | null> {
        const cacheKey = `meta:mediaInsights:${mediaId}`

        // Manual cache check — we can't use getCached because we need to
        // conditionally skip caching when all metrics are zero.
        if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
            try {
                const { redis } = await import('@/lib/redis')
                const cached = await redis.get<{ v: { views: number, reach: number, saves: number, likes: number } | null }>(cacheKey)
                if (cached !== null) {
                    console.log(`[Redis Cache Hit] Key: ${cacheKey}`)
                    return cached.v
                }
            } catch (e) {
                console.warn(`[Redis Cache Error] Key: ${cacheKey}`, e)
            }
        }

        try {
            // 1. Fetch basic media fields (likes)
            const basicRes = await graphApi.get(`/${mediaId}`, {
                params: {
                    fields: 'like_count',
                    access_token: accessToken,
                }
            })
            const likes = basicRes.data.like_count || 0

            // 2. Fetch insights (Graph API v22.0 replaces plays/impressions with unified 'views')
            const response = await graphApi.get(`/${mediaId}/insights`, {
                params: {
                    metric: 'reach,saved,views',
                    access_token: accessToken,
                }
            })

            const data = response.data.data
            if (!data || !Array.isArray(data)) return null

            let views = 0
            let reach = 0
            let saves = 0

            for (const metric of data) {
                const value = typeof metric.value === 'number' ? metric.value : (metric.values?.[0]?.value || 0)
                if (metric.name === 'views') views = value
                if (metric.name === 'reach') reach = value
                if (metric.name === 'saved') saves = value
            }

            const result = { views, reach, saves, likes }

            // Don't cache all-zero insights — the post was likely just published
            // and Instagram hasn't computed real metrics yet. Skipping the cache
            // lets the next cron invocation re-fetch and pick up actual data.
            if (views === 0 && reach === 0 && saves === 0 && likes === 0) {
                console.log(`[FacebookService] Skipping cache for media ${mediaId} — all metrics are zero (likely too fresh).`)
                return result
            }

            // Cache non-zero results for 10 minutes
            if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
                try {
                    const { redis } = await import('@/lib/redis')
                    await redis.set(cacheKey, { v: result }, { ex: 600 })
                } catch (e) {
                    console.warn(`[Redis Cache Error] Key: ${cacheKey}`, e)
                }
            }

            return result
        } catch (error: any) {
            const fbError = error.response?.data?.error
            if (fbError?.code === 100 && fbError?.error_subcode === 33) {
                // Media likely deleted on Instagram or unsupported media type (e.g., expired story)
                console.warn(`[FacebookService] Media ${mediaId} not found or unsupported (likely deleted on IG).`)
            } else {
                console.error(`[FacebookService] Failed to fetch insights for media ${mediaId}:`, error.response?.data || error.message)
            }
            return null
        }
    },

    /**
     * Fetch account-level insights for an Instagram Business Account (last 30 days).
     * NOTE: `impressions` and `likes` are deprecated. Using `reach` and `profile_views` instead.
     */
    async getAccountInsights(igBusinessId: string, accessToken: string): Promise<{ totalImpressions: number, totalLikes: number } | null> {
        return getCached(`meta:accountInsights:${igBusinessId}`, async () => {
            try {
                const since = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000)
                const until = Math.floor(Date.now() / 1000)

                // `reach` is a time-series metric — fetched with period=day
                const reachResponse = await graphApi.get(`/${igBusinessId}/insights`, {
                    params: {
                        metric: 'reach',
                        period: 'day',
                        since,
                        until,
                        access_token: accessToken,
                    }
                })

                // `profile_views` requires metric_type=total_value (cannot be mixed with time-series metrics)
                const profileViewsResponse = await graphApi.get(`/${igBusinessId}/insights`, {
                    params: {
                        metric: 'profile_views',
                        metric_type: 'total_value',
                        period: 'day',
                        since,
                        until,
                        access_token: accessToken,
                    }
                })

                let totalImpressions = 0
                let totalLikes = 0

                const reachData: { name: string; values: { value: number }[] }[] = reachResponse.data.data
                if (Array.isArray(reachData)) {
                    for (const metric of reachData) {
                        const sum = metric.values.reduce((acc, v) => acc + (v.value || 0), 0)
                        if (metric.name === 'reach') totalImpressions = sum
                    }
                }

                // total_value response shape: { data: [{ name, period, title, id, total_value: { value } }] }
                const pvData: { name: string; total_value?: { value: number }; values?: { value: number }[] }[] = profileViewsResponse.data.data
                if (Array.isArray(pvData)) {
                    for (const metric of pvData) {
                        if (metric.name === 'profile_views') {
                            totalLikes = metric.total_value?.value
                                ?? metric.values?.reduce((acc, v) => acc + (v.value || 0), 0)
                                ?? 0
                        }
                    }
                }

                return { totalImpressions, totalLikes }
            } catch (error: any) {
                const fbError = error.response?.data?.error
                if (fbError && fbError.code === 190) {
                    throw new FacebookApiError('Token invalid', fbError.code, fbError.error_subcode)
                }
                console.error(`[FacebookService] Failed to fetch account insights for ${igBusinessId}:`, error.response?.data || error.message)
                return null
            }
        }, 600) // Cache for 10 minutes
    },

    /**
     * Fetch followers count for an Instagram Business Account.
     */
    async getInstagramFollowersCount(igBusinessId: string, accessToken: string): Promise<number> {
        return getCached(`meta:followersCount:${igBusinessId}`, async () => {
            try {
                const response = await graphApi.get(`/${igBusinessId}`, {
                    params: {
                        fields: 'followers_count',
                        access_token: accessToken,
                    }
                })
                return response.data.followers_count || 0
            } catch (error: any) {
                const fbError = error.response?.data?.error
                if (fbError && fbError.code === 190) {
                    throw new FacebookApiError('Token invalid', fbError.code, fbError.error_subcode)
                }
                console.error(`[FacebookService] Failed to fetch followers count for ${igBusinessId}:`, error.response?.data || error.message)
                return 0
            }
        }, 600) // Cache for 10 minutes
    },
    

    /**
     * Fetch the ID for a given hashtag string.
     */
    async getHashtagId(igBusinessId: string, hashtag: string, accessToken: string): Promise<string | null> {
        const cleanHashtag = hashtag.replace(/^#/, '')
        return getCached(`meta:hashtagId:${igBusinessId}:${cleanHashtag}`, async () => {
            try {
                const response = await graphApi.get(`/ig_hashtag_search`, {
                    params: {
                        user_id: igBusinessId,
                        q: cleanHashtag,
                        access_token: accessToken,
                    }
                })
                return response.data.data?.[0]?.id || null
            } catch (error: any) {
                console.error(`[FacebookService] Failed to fetch hashtag ID for ${hashtag}:`, error.response?.data || error.message)
                return null
            }
        }, 86400) // Cache for 24 hours
    },

    /**
     * Fetch top media for a given hashtag ID.
     */
    async getHashtagTopMedia(hashtagId: string, igBusinessId: string, accessToken: string): Promise<any[]> {
        try {
            const response = await graphApi.get(`/${hashtagId}/top_media`, {
                params: {
                    user_id: igBusinessId,
                    fields: 'id,media_type,media_url,permalink,caption',
                    limit: 3,
                    access_token: accessToken,
                }
            })
            return response.data.data || []
        } catch (error: any) {
            console.error(`[FacebookService] Failed to fetch top media for hashtag ${hashtagId}:`, error.response?.data || error.message)
            return []
        }
    },

    /**
     * Fetch basic profile data for a given Instagram username using the Business Discovery API.
     */
    async getBusinessDiscoveryProfile(igBusinessId: string, username: string, accessToken: string): Promise<{ id: string, username: string, profile_picture_url?: string, followers_count?: number, media_count?: number, biography?: string } | null> {
        try {
            const response = await graphApi.get(`/${igBusinessId}`, {
                params: {
                    fields: `business_discovery.username(${username}){username,profile_picture_url,followers_count,media_count,biography}`,
                    access_token: accessToken,
                }
            })
            
            const bd = response.data?.business_discovery
            if (bd) {
                return {
                    id: bd.id,
                    username: bd.username,
                    profile_picture_url: bd.profile_picture_url,
                    followers_count: bd.followers_count,
                    media_count: bd.media_count,
                    biography: bd.biography
                }
            }
            return null
        } catch (error: any) {
            // Silently move on if not found or error
            console.warn(`[FacebookService] Business discovery failed for ${username}:`, error.response?.data?.error?.message || error.message)
            return null
        }
    },
}
