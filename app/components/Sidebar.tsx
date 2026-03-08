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
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Create Content', href: '/create', icon: PlusCircle },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Workflow', href: '/workflow', icon: ListChecks },
    { name: 'Accounts', href: '/account', icon: Instagram },
    { name: 'Settings', href: '/settings', icon: Settings },
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
                <Link href="/dashboard" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl instagram-gradient flex items-center justify-center shadow-sm">
                        <Instagram className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent instagram-gradient">
                        Postara
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
                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${isActive
                                ? 'bg-purple-50 text-purple-600 shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-600'
                                    }`} />
                                {item.name}
                            </div>
                            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />}
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom Section: Profile/Logout */}
            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all group"
                >
                    <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
                    Sign Out
                </button>

                <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold shadow-sm overflow-hidden">
                            {user?.image ? (
                                <img src={user.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                                initials
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'User'}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                </div>
            </div>
        </aside>
    )
}
