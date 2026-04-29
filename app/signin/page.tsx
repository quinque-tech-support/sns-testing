'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { validateEmail } from '@/lib/validation'
import { Instagram, Loader2, ArrowLeft } from 'lucide-react'

function SignInForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const message = searchParams.get('message')
    
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        const emailValidation = validateEmail(email)
        if (!emailValidation.valid) {
            setError(emailValidation.error || '有効なメールアドレスを入力してください。')
            return
        }

        setLoading(true)

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                setError('メールアドレスまたはパスワードが正しくありません。')
            } else {
                window.location.replace('/dashboard')
            }
        } catch {
            setError('エラーが発生しました。もう一度お試しください。')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full">
            {message && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl text-sm font-medium">
                    {message}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm font-medium">
                        {error}
                    </div>
                )}

                <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-sm font-bold text-gray-700">
                        メールアドレス
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all font-medium text-gray-900 placeholder:text-gray-400"
                        placeholder="you@example.com"
                    />
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="password" className="block text-sm font-bold text-gray-700">
                        パスワード
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all font-medium text-gray-900 placeholder:text-gray-400"
                        placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gray-900 text-white py-4 px-4 rounded-2xl font-bold shadow-lg shadow-gray-900/20 hover:bg-gray-800 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> サインイン中...</> : 'サインイン'}
                </button>
            </form>
        </div>
    )
}

export default function SignIn() {
    const router = useRouter()
    const { status } = useSession()

    useEffect(() => {
        if (status === 'authenticated') {
            router.replace('/dashboard')
        }
    }, [status, router])

    if (status === 'loading' || status === 'authenticated') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
                <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4 font-sans selection:bg-gray-200 relative">
            <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-4 h-4" /> ホームに戻る
            </Link>

            <div className="max-w-md w-full bg-white rounded-[2rem] border border-gray-100 p-8 shadow-xl shadow-gray-200/50">
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-gray-900 to-gray-600 flex items-center justify-center shadow-lg shadow-gray-900/20 mb-6 rotate-12 hover:rotate-0 transition-transform duration-300">
                        <Instagram className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">お帰りなさい</h1>
                    <p className="text-sm font-medium text-gray-500 mt-2">アカウントにサインインして続行します</p>
                </div>

                <Suspense fallback={<div className="h-64 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-900" /></div>}>
                    <SignInForm />
                </Suspense>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-sm font-medium text-gray-500">
                        アカウントをお持ちではありませんか？{' '}
                        <Link href="/signup" className="text-gray-900 font-bold hover:text-gray-700 transition-colors">
                            無料で登録
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
