import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Next.js only statically inlines NEXT_PUBLIC_* vars into the browser bundle
// when the source uses a literal `process.env.NEXT_PUBLIC_X` reference — a
// dynamic `process.env[name]` lookup can't be resolved at build time, so in
// the browser (which has no real process.env) it silently evaluates to
// undefined. These must stay as literal accesses, not routed through a
// generic requireEnv(name) helper.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
// Server-only secret — real process.env lookups work fine here since this
// code path only ever runs on the server.
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

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

export const supabase = lazyClient(() => {
    if (!supabaseUrl) throw new Error('NEXT_PUBLIC_SUPABASE_URL is required but not set')
    if (!supabaseAnonKey) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required but not set')
    return createClient(supabaseUrl, supabaseAnonKey)
})

export const supabaseAdmin = lazyClient(() => {
    if (!supabaseUrl) throw new Error('NEXT_PUBLIC_SUPABASE_URL is required but not set')
    if (!serviceRoleKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required but not set')
    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
})
