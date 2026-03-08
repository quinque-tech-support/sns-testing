'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
    Bell,
    ChevronDown,
    Search,
    Instagram,
    Menu,
    Plus,
    X,
    Filter
} from 'lucide-react'

interface TopbarProps {
    user?: {
        name?: string | null
        email?: string | null
        image?: string | null
    }
    accounts?: any[]
}

export function Topbar({ user, accounts = [] }: TopbarProps) {
    const [selectedAccount, setSelectedAccount] = useState(accounts[0]?.username || '@no_account')
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)
    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
        : user?.email?.substring(0, 2).toUpperCase() || 'JD'

    return (
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30 shadow-[0_1px_2px_0_rgba(0,0,0,0.03)]">
            {/* Left: Mobile Menu & Search */}
            <div className="flex items-center gap-4 flex-1">
                <button className="lg:hidden p-2 hover:bg-gray-50 rounded-lg text-gray-500">
                    <Menu className="w-5 h-5" />
                </button>

                <div className="hidden md:flex items-center relative max-w-md w-full group">
                    <Search className="absolute left-3 w-4 h-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search posts, analytics, themes..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all"
                    />
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3 lg:gap-6">
                {/* Account Selector */}
                <div className="relative">
                    <button className="flex items-center gap-2.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all group">
                        <div className="w-6 h-6 rounded-full instagram-gradient flex items-center justify-center p-0.5 shadow-sm">
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                                <Instagram className="w-3.5 h-3.5 instagram-text-gradient" />
                            </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-800 hidden sm:inline">{selectedAccount}</span>
                        <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </button>
                </div>

                <div className="h-8 w-[1px] bg-gray-100 hidden sm:block" />

                {/* Quick Action */}
                <Link href="/create" className="hidden sm:flex items-center gap-2 px-4 py-2 instagram-gradient text-white rounded-xl text-sm font-semibold shadow-md shadow-purple-500/20 hover:opacity-90 transition-all active:scale-95">
                    <Plus className="w-4 h-4" />
                    Create Post
                </Link>

                {/* Notifications */}
                <button
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className="relative p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-xl transition-all"
                >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
                </button>

                {/* Profile Toggle (Mobile/Mini) */}
                <button className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all sm:hidden">
                    <div className="w-7 h-7 rounded-lg bg-purple-500 text-white flex items-center justify-center text-xs font-bold">
                        JD
                    </div>
                </button>
            </div>
        </header>
    )
}
