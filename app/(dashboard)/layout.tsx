import { Sidebar } from '@/app/components/Sidebar'
import { Topbar } from '@/app/components/Topbar'
import { AccountProvider } from '@/app/components/AccountContext'
import { SidebarProvider } from '@/app/components/SidebarContext'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session?.user?.id) {
        redirect('/signin')
    }

    // Fetch connected accounts for the account selector
    const connectedAccounts = await prisma.connectedAccount.findMany({
        where: { userId: session.user.id },
        select: {
            id: true,
            username: true,
            pageId: true,
            instagramBusinessId: true
        }
    })

    return (
        <AccountProvider accounts={connectedAccounts}>
            <SidebarProvider>
                <div className="flex flex-col h-screen bg-gray-50 overflow-hidden font-sans">
                    <Topbar user={session.user} />
                    <div className="flex-1 flex min-h-0 overflow-hidden">
                        <Sidebar user={session.user} />
                        {/* Main Content Area */}
                        <main className="flex-1 overflow-y-auto px-4 py-5 lg:px-8">
                            <div className="max-w-7xl mx-auto space-y-5 lg:space-y-6">
                                {children}
                            </div>
                        </main>
                    </div>
                </div>
            </SidebarProvider>
        </AccountProvider>
    )
}
