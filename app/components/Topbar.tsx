'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
    ChevronDown,
    Instagram,
    Menu
} from 'lucide-react'
import { useAccount } from './AccountContext'
import { useSidebar } from './SidebarContext'

interface TopbarProps {
    user?: {
        name?: string | null
        email?: string | null
        image?: string | null
    }
}

export function Topbar({ user }: TopbarProps) {
    const { accounts, selectedAccountId, setSelectedAccountId, activeAccount } = useAccount()
    const { toggleSidebar } = useSidebar()
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
        : user?.email?.substring(0, 2).toUpperCase() || 'JD'

    return (
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30 shadow-[0_1px_2px_0_rgba(0,0,0,0.03)]">
            {/* Left: Mobile Menu & Search */}
            <div className="flex items-center gap-3 md:gap-5 flex-1">
                <button 
                    onClick={toggleSidebar}
                    aria-label="Toggle Menu"
                    className="p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-all duration-200 ease-out active:scale-95"
                >
                    <Menu className="w-5 h-5" />
                </button>

                <Link href="/dashboard" className="flex items-center gap-1 group transition-transform duration-200 ease-out active:scale-[0.98] mr-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center shadow-sm">
                        <Instagram className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold tracking-tight text-xl text-gray-900 hidden sm:block">
                        Schedlify
                    </span>
                </Link>

            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3 lg:gap-6">
                {/* Account Selector */}
                {accounts.length > 0 && (
                    <div className="relative">
                        <button 
                            onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                            className="flex items-center gap-2.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all duration-200 ease-out active:scale-95 group"
                        >
                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-gray-900 to-gray-600 flex items-center justify-center p-0.5 shadow-sm">
                                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                                    <Instagram className="w-3.5 h-3.5 text-gray-800" />
                                </div>
                            </div>
                            <span className="text-sm font-semibold text-gray-800 hidden sm:inline">
                                @{activeAccount?.username || activeAccount?.pageId || 'no_account'}
                            </span>
                            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        </button>
                        
                        {isAccountMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsAccountMenuOpen(false)}></div>
                                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-2 top-full">
                                    <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        アカウント切り替え
                                    </div>
                                    <div className="max-h-60 overflow-y-auto">
                                        {accounts.map(acc => (
                                            <button
                                                key={acc.id}
                                                onClick={() => {
                                                    setSelectedAccountId(acc.id)
                                                    setIsAccountMenuOpen(false)
                                                }}
                                                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-gray-50 transition-colors ${selectedAccountId === acc.id ? 'bg-purple-50/50 text-purple-700 font-medium' : 'text-gray-700'}`}
                                            >
                                                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 shrink-0">
                                                    <Instagram className="w-3.5 h-3.5 text-gray-500" />
                                                </div>
                                                <span className="truncate">@{acc.username || acc.pageId}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                <div className="h-8 w-[1px] bg-gray-100 hidden sm:block" />

                {/* Profile Toggle (Mobile/Mini) */}
                <button className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all duration-200 ease-out active:scale-95 sm:hidden">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-gray-900 to-gray-600 text-white flex items-center justify-center text-xs font-bold">
                        {initials}
                    </div>
                </button>
            </div>
        </header>
    )
}
