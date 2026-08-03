import { createClient, type SupabaseClient } from '@supabase/supabase-js'

function requireEnv(name: string): string {
    const value = process.env[name]
    if (!value) {
        throw new Error(`${name} is required but not set`)
    }
    return value
}

/**
 * Lazily constructs the client on first property access instead of at module
 * load. A previous version eagerly called createClient() with real env vars
 * at the top of this module, which crashed at build time in environments
 * where those vars weren't yet available (see PR #91). Falling back to
 * placeholder credentials avoided that crash but silently pointed the app at
 * a fake host on misconfiguration. Deferring construction until actual use
 * gets both: no top-level crash, and a clear error the moment the client is
 * used without valid credentials.
 */
function lazyClient(factory: () => SupabaseClient): SupabaseClient {
    let instance: SupabaseClient | null = null
    return new Proxy({} as SupabaseClient, {
        get(_target, prop, receiver) {
            if (!instance) {
                instance = factory()
            }
            return Reflect.get(instance, prop, receiver)
        },
    })
}

export const supabase = lazyClient(() =>
    createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'))
)

export const supabaseAdmin = lazyClient(() =>
    createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
)
