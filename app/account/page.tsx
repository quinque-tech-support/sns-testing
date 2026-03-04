import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AccountPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const session = await auth()
    const error = searchParams?.error as string | undefined
    const success = searchParams?.success as string | undefined

    if (!session?.user?.id) {
        redirect('/signin')
    }

    const connectedAccounts = await prisma.connectedAccount.findMany({
        where: {
            userId: session.user.id
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-300 px-6 py-4 flex justify-between items-center">
                <Link href="/" className="text-xl font-bold text-gray-900">Insta Auto</Link>
                <div className="space-x-4">
                    <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium">Dashboard</Link>
                    <Link href="/account" className="text-gray-900 font-semibold border-b-2 border-gray-900 pb-1">Account</Link>
                </div>
            </nav>

            {/* Account Settings Content */}
            <main className="flex-grow max-w-4xl mx-auto w-full p-6 md:p-10">
                <div className="bg-white border border-gray-300 rounded-xl p-8 shadow-sm">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-700 flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Connection Failed</h3>
                                <div className="mt-1 text-sm text-red-700">{error}</div>
                            </div>
                        </div>
                    )}
                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg text-green-700 flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-green-800">Connection Successful</h3>
                                <div className="mt-1 text-sm text-green-700">Your Facebook and Instagram accounts were linked successfully.</div>
                            </div>
                        </div>
                    )}

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Connected Accounts</h1>
                    <p className="text-gray-600 mb-8">Link your Facebook Pages and Instagram Business Accounts to enable automated publishing.</p>

                    <div className="mb-10">
                        <Link
                            href="/api/auth/facebook"
                            className="inline-flex items-center justify-center bg-[#1877F2] hover:bg-[#166FE5] text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm"
                        >
                            {/* Simple Facebook Icon SVG */}
                            <svg className="w-5 h-5 mr-3 fill-current" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            Connect Facebook
                        </Link>
                    </div>

                    <div className="border-t border-gray-200 mt-8 pt-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Linked Pages</h2>

                        {connectedAccounts.length === 0 ? (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-500">
                                You haven&apos;t connected any Facebook Pages with Instagram Business accounts yet.
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {connectedAccounts.map((account) => (
                                    <div key={account.id} className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">Active</span>
                                            </div>
                                            <div className="text-gray-900 font-medium mb-1 truncate">Page ID: {account.pageId}</div>
                                            <div className="text-sm text-gray-600 truncate">Instagram ID: {account.instagramBusinessId}</div>
                                        </div>
                                        <div className="mt-4 text-xs text-gray-400">
                                            Linked on {new Date(account.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
