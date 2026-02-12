import NextAuth from "next-auth"
import { SupabaseAdapter } from "@auth/supabase-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { supabaseAdmin } from "@/lib/supabase"
import { validateEmail } from "@/lib/validation"

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: SupabaseAdapter({
        url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    }),
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "you@example.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                // Early exit for invalid email formats
                const { valid } = validateEmail(credentials.email as string)
                if (!valid) {
                    return null
                }

                const { data: user, error } = await supabaseAdmin
                    .from('users')
                    .select('id, email, name, password_hash')
                    .eq('email', credentials.email)
                    .single()

                if (error || !user) {
                    return null
                }

                if (!user.password_hash) {
                    return null
                }

                const isPasswordValid = await compare(
                    credentials.password as string,
                    user.password_hash
                )

                if (!isPasswordValid) {
                    return null
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                }
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: '/signin',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
            }
            return session
        },
    },
})
