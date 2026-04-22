import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Session } from 'next-auth'

/**
 * Ensures the current API request or Server Action has an authenticated user session.
 * Throws an error with `isAuthError` flag if unauthorized.
 * Use this in API Routes and Server Actions.
 * @returns The authenticated user's ID
 */
export async function requireAuth(): Promise<string> {
    const session = await auth()
    if (!session?.user?.id) {
        throw Object.assign(new Error('Unauthorized'), { isAuthError: true })
    }
    return session.user.id
}

/**
 * Ensures the current Page has an authenticated user session.
 * Redirects to /signin if unauthorized.
 * Use this ONLY in Server Components (Pages/Layouts).
 * @returns The authenticated session
 */
export async function requirePageAuth(): Promise<Session> {
    const session = await auth()
    if (!session?.user?.id) {
        redirect('/signin')
    }
    return session
}
