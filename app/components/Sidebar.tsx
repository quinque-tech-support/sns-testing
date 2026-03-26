'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    PlusCircle,
    Calendar,
    BarChart3,
    ListChecks,
    Instagram,
    Settings,
    LogOut,
    ChevronRight
} from 'lucide-react'
import { signOut } from 'next-auth/react'

const navigation = [
    { name: 'ダッシュボード', href: '/dashboard', icon: LayoutDashboard },
    { name: 'コンテンツ作成', href: '/create', icon: PlusCircle },
    { name: 'カレンダー', href: '/calendar', icon: Calendar },
    { name: 'アナリティクス', href: '/analytics', icon: BarChart3 },
    { name: 'ワークフロー', href: '/workflow', icon: ListChecks },
    { name: 'アカウント', href: '/account', icon: Instagram },
    { name: '設定', href: '/settings', icon: Settings },
]

interface SidebarProps {
    user?: {
        name?: string | null
        email?: string | null
        image?: string | null
    }
}

export function Sidebar({ user }: SidebarProps) {
    const pathname = usePathname()
    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
        : user?.email?.substring(0, 2).toUpperCase() || 'JD'

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0 overflow-y-auto">
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-gray-100">
                <Link href="/dashboard" className="flex items-center gap-2.5 group transition-transform duration-200 ease-out active:scale-[0.98]">
                    <div className="w-9 h-9 rounded-xl instagram-gradient flex items-center justify-center shadow-sm group-hover:shadow-[0_4px_12px_rgba(217,70,239,0.3)] transition-shadow duration-300">
                        <Instagram className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold tracking-tight text-xl bg-clip-text instagram-gradient">
                        Schedlify
                    </span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1.5">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ease-out active:scale-[0.98] group ${isActive
                                ? 'bg-purple-50 text-purple-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),_0_1px_2px_rgba(0,0,0,0.02)]'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-600'
                                    }`} />
                                {item.name}
                            </div>
                            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-purple-600 shadow-[0_0_8px_rgba(147,51,234,0.5)]" />}
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom Section: Profile/Logout */}
            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 ease-out active:scale-[0.98] group"
                >
                    <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                    ログアウト
                </button>

                <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:bg-white transition-all duration-200 ease-out hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] ring-1 ring-transparent hover:ring-gray-200 active:scale-[0.98] group">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold shadow-sm overflow-hidden group-hover:shadow-md transition-shadow">
                            {user?.image ? (
                                <img src={user.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                                initials
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'User'}</p>
                            <p className="text-xs font-medium text-gray-500 truncate">{user?.email}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </div>
                </div>
            </div>
        </aside>
    )
}
