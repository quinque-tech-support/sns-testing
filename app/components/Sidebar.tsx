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
    ChevronRight,
    X
} from 'lucide-react'
import { signOut } from 'next-auth/react'

const navigation = [
    { name: 'ダッシュボード', href: '/dashboard', icon: LayoutDashboard },
    { name: 'コンテンツ作成', href: '/create', icon: PlusCircle },
    { name: 'カレンダー', href: '/calendar', icon: Calendar },
    { name: 'アナリティクス', href: '/analytics', icon: BarChart3 },
    { name: '投稿履歴', href: '/workflow', icon: ListChecks },
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

import { useSidebar } from './SidebarContext'

export function Sidebar({ user }: SidebarProps) {
    const pathname = usePathname()
    const { isOpen, closeSidebar } = useSidebar()
    
    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
        : user?.email?.substring(0, 2).toUpperCase() || 'JD'

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={closeSidebar}
                />
            )}
            
            <aside 
                className={`fixed lg:relative inset-y-0 left-0 z-50 bg-white border-r border-gray-200 flex flex-col h-full overflow-y-auto transform transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] shrink-0 ${isOpen ? 'w-64 translate-x-0 shadow-2xl lg:shadow-none' : 'w-64 -translate-x-full lg:translate-x-0 lg:w-20'}`}
            >
                {/* Close Button / Mobile Header */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 lg:hidden">
                    <span className="font-bold text-gray-900 tracking-tight text-lg">Menu</span>
                    <button 
                        onClick={closeSidebar}
                        className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-2 overflow-x-hidden">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ease-out active:scale-[0.98] group relative ${isActive
                                ? 'bg-purple-50 text-purple-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),_0_1px_2px_rgba(0,0,0,0.02)]'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                } ${!isOpen ? 'lg:justify-center' : ''}`}
                            title={!isOpen ? item.name : undefined}
                        >
                            <item.icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-600'
                                }`} />
                            
                            <span className={`ml-3 whitespace-nowrap transition-all duration-200 ${isOpen ? 'opacity-100 flex-1' : 'lg:hidden opacity-0 w-0'}`}>
                                {item.name}
                            </span>
                            
                            {isActive && isOpen && <div className="w-1.5 h-1.5 rounded-full bg-purple-600 shadow-[0_0_8px_rgba(147,51,234,0.5)] shrink-0 ml-auto" />}
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom Section: Profile/Logout */}
            <div className={`p-4 border-t border-gray-100 ${!isOpen ? 'lg:p-2' : ''}`}>
                <button
                    onClick={() => signOut()}
                    className={`w-full flex items-center justify-center px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 ease-out active:scale-[0.98] group ${!isOpen ? 'lg:px-0 lg:py-3' : ''}`}
                    title={!isOpen ? 'ログアウト' : undefined}
                >
                    <LogOut className="w-5 h-5 shrink-0 text-gray-400 group-hover:text-red-500 transition-colors" />
                    <span className={`ml-3 whitespace-nowrap transition-all duration-200 ${isOpen ? 'opacity-100' : 'lg:hidden opacity-0 w-0'}`}>
                        ログアウト
                    </span>
                </button>

                <div className={`mt-4 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:bg-white transition-all duration-200 ease-out hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] ring-1 ring-transparent hover:ring-gray-200 active:scale-[0.98] group ${isOpen ? 'p-3' : 'lg:p-1.5 p-3'}`} title={!isOpen ? user?.name || 'User' : undefined}>
                    <div className={`flex items-center ${!isOpen ? 'lg:justify-center' : 'gap-3'}`}>
                        <div className={`rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold shadow-sm overflow-hidden group-hover:shadow-md transition-shadow shrink-0 ${isOpen ? 'w-10 h-10' : 'lg:w-8 lg:h-8 w-10 h-10 text-xs'}`}>
                            {user?.image ? (
                                <img src={user.image} alt="User avatar" className="w-full h-full object-cover" />
                            ) : (
                                initials
                            )}
                        </div>
                        <div className={`flex-1 min-w-0 transition-all duration-200 flex flex-col justify-center ${isOpen ? 'opacity-100' : 'lg:hidden opacity-0 w-0'}`}>
                            <p className="text-sm font-semibold text-gray-900 truncate tracking-tight">{user?.name || 'User'}</p>
                            <p className="text-[10px] sm:text-xs font-medium text-gray-500 truncate">{user?.email}</p>
                        </div>
                        {isOpen && <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors shrink-0" />}
                    </div>
                </div>
            </div>
        </aside>
    </>
    )
}
