'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createUser } from '@/app/actions/auth'
import { checkPasswordStrength, isPasswordStrong, type PasswordStrength } from '@/lib/validation'
import { Instagram, Loader2, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react'

function SignUpForm() {
    const router = useRouter()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
        hasMinLength: false,
        hasLowercase: false,
        hasUppercase: false,
        hasNumber: false,
        hasSpecialChar: false,
    })

    const handlePasswordChange = (newPassword: string) => {
        setPassword(newPassword)
        setPasswordStrength(checkPasswordStrength(newPassword))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (name.trim().length < 2) {
            setError('名前は2文字以上である必要があります。')
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            setError('有効なメールアドレスを入力してください。')
            return
        }

        if (!isPasswordStrong(passwordStrength)) {
            setError('パスワードの要件をすべて満たしてください。')
            return
        }

        if (password !== confirmPassword) {
            setError('パスワードが一致しません。')
            return
        }

        setLoading(true)

        try {
            const result = await createUser(name, email, password)

            if (!result.success) {
                setError(result.error || 'アカウントの作成に失敗しました。')
                return
            }

            router.push('/signin?message=アカウントが正常に作成されました。サインインしてください。')
        } catch (err) {
            console.error('Signup error:', err)
            setError('エラーが発生しました。もう一度お試しください。')
        } finally {
            setLoading(false)
        }
    }

    const Requirement = ({ met, text }: { met: boolean; text: string }) => (
        <div className={`flex items-center gap-1.5 text-xs font-bold ${met ? 'text-green-600' : 'text-gray-400'}`}>
            {met ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5 opacity-50" />}
            {text}
        </div>
    )

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm font-medium">
                    {error}
                </div>
            )}

            <div className="space-y-1.5">
                <label htmlFor="name" className="block text-sm font-bold text-gray-700">
                    フルネーム
                </label>
                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium text-gray-900 placeholder:text-gray-400"
                    placeholder="John Doe"
                />
            </div>

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
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium text-gray-900 placeholder:text-gray-400"
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
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    required
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium text-gray-900 placeholder:text-gray-400"
                    placeholder="••••••••"
                />
                <div className="pt-2 grid grid-cols-2 gap-2">
                    <Requirement met={passwordStrength.hasMinLength} text="8文字以上" />
                    <Requirement met={passwordStrength.hasUppercase} text="大文字を含む" />
                    <Requirement met={passwordStrength.hasNumber} text="数字を含む" />
                    <Requirement met={passwordStrength.hasSpecialChar} text="記号を含む" />
                </div>
            </div>

            <div className="space-y-1.5 pt-2">
                <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700">
                    パスワードの確認
                </label>
                <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium text-gray-900 placeholder:text-gray-400"
                    placeholder="••••••••"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full instagram-gradient text-white py-4 px-4 rounded-2xl font-bold shadow-lg shadow-purple-500/20 hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
            >
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> アカウント作成中...</> : '無料で登録する'}
            </button>
        </form>
    )
}

export default function SignUp() {
    const router = useRouter()
    const { status } = useSession()

    useEffect(() => {
        if (status === 'authenticated') {
            router.replace('/dashboard')
        }
    }, [status, router])

    if (status === 'loading' || status === 'authenticated') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans selection:bg-purple-100 relative">
            <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-4 h-4" /> ホームに戻る
            </Link>

            <div className="max-w-md w-full bg-white rounded-[2rem] border border-gray-100 p-8 shadow-xl shadow-gray-200/50 my-12">
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl instagram-gradient flex items-center justify-center shadow-lg shadow-purple-500/20 mb-6 -rotate-12 hover:rotate-0 transition-transform duration-300">
                        <Instagram className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">アカウント作成</h1>
                    <p className="text-sm font-medium text-gray-500 mt-2">今日からコンテンツ管理を始めましょう</p>
                </div>

                <Suspense fallback={<div className="h-64 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-purple-500" /></div>}>
                    <SignUpForm />
                </Suspense>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-sm font-medium text-gray-500">
                        すでにアカウントをお持ちですか？{' '}
                        <Link href="/signin" className="text-purple-600 font-bold hover:text-purple-700 transition-colors">
                            サインイン
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
