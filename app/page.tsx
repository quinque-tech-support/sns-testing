'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function Home() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-900">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-300 px-6 py-4 flex justify-between items-center">
        <div className="text-xl font-bold text-gray-900">Insta Auto</div>
        {session && (
          <div className="space-x-4">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium">Dashboard</Link>
            <Link href="/account" className="text-gray-600 hover:text-gray-900 font-medium">Account</Link>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-gray-300 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Insta Auto
          </h1>

          {session ? (
            <div className="space-y-4">
              <div className="border border-gray-300 p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Welcome back!
                </h2>
                <div className="space-y-1 text-sm text-gray-700">
                  <p>
                    <span className="font-medium">Email:</span> {session.user?.email}
                  </p>
                  {session.user?.name && (
                    <p>
                      <span className="font-medium">Name:</span> {session.user.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Link
                  href="/dashboard"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 text-center"
                >
                  Go to Dashboard
                </Link>

                <button
                  onClick={() => signOut()}
                  className="w-full bg-white hover:bg-gray-100 text-gray-900 py-2 px-4 border border-gray-300"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-700 text-center">
                Get started with Instagram automation
              </p>

              <div className="space-y-2">
                <Link
                  href="/signin"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 text-center"
                >
                  Sign In
                </Link>

                <Link
                  href="/signup"
                  className="block w-full bg-white hover:bg-gray-100 text-gray-900 py-2 px-4 text-center border border-gray-300"
                >
                  Create Account
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
