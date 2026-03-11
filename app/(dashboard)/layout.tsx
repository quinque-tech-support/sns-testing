import { Sidebar } from '@/app/components/Sidebar'
import { Topbar } from '@/app/components/Topbar'
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
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* Sidebar - Desktop Only */}
            <div className="hidden lg:block shrink-0">
                <Sidebar user={session.user} />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Topbar user={session.user} accounts={connectedAccounts} />
                <main className="flex-1 overflow-y-auto px-4 py-8 lg:px-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
