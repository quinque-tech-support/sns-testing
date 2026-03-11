import axios, { AxiosError } from 'axios'

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
const FACEBOOK_REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI

const graphApi = axios.create({
    baseURL: 'https://graph.facebook.com/v19.0',
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
    generateAuthUrl(state: string): string {
        const params = new URLSearchParams({
            client_id: FACEBOOK_APP_ID,
            redirect_uri: FACEBOOK_REDIRECT_URI!,
            state: state,
            scope: 'pages_show_list,instagram_basic,instagram_content_publish,pages_read_engagement',
            response_type: 'code',
        })
        return `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`
    },
    /**
     * Exchange the short-lived authorization code for a short-lived access token
     */
    async exchangeCodeForToken(code: string): Promise<string> {
        try {
            const response = await axios.get<AccessTokenResponse>(`https://graph.facebook.com/v19.0/oauth/access_token`, {
                params: {
                    client_id: FACEBOOK_APP_ID,
                    client_secret: FACEBOOK_APP_SECRET,
                    redirect_uri: FACEBOOK_REDIRECT_URI,
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
            const response = await axios.get<AccessTokenResponse>(`https://graph.facebook.com/v19.0/oauth/access_token`, {
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
    },

    /**
     * Fetch all pages the user manages
     */
    async getUserPages(accessToken: string): Promise<FacebookPage[]> {
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
    },

    /**
     * Fetch the Instagram Business Account ID associated with a given Page
     */
    async getInstagramBusinessAccount(pageId: string, pageAccessToken: string): Promise<InstagramBusinessAccount | null> {
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
    },

    /**
     * Fetch insights (impressions, reach, saved) for a published IG Media
     */
    async getMediaInsights(mediaId: string, accessToken: string): Promise<{ views: number, reach: number, saves: number } | null> {
        try {
            const response = await graphApi.get(`/${mediaId}/insights`, {
                params: {
                    metric: 'impressions,reach,saved',
                    access_token: accessToken,
                }
            })

            const data = response.data.data
            if (!data || !Array.isArray(data)) return null

            let views = 0
            let reach = 0
            let saves = 0

            for (const metric of data) {
                const value = metric.values?.[0]?.value || 0
                if (metric.name === 'impressions') views = value
                if (metric.name === 'reach') reach = value
                if (metric.name === 'saved') saves = value
            }

            return { views, reach, saves }
        } catch (error: any) {
            console.error(`[FacebookService] Failed to fetch insights for media ${mediaId}:`, error.response?.data || error.message)
            return null
        }
    }
}
