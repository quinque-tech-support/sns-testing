import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import CreateContentClient from './CreateContentClient'

export const dynamic = 'force-dynamic'

export default async function CreateContentPage() {
    const session = await auth()
    if (!session?.user?.id) redirect('/signin')

    const accounts = await prisma.connectedAccount.findMany({
        where: { userId: session.user.id },
        select: {
            id: true,
            username: true,
            pageId: true,
        },
        orderBy: { createdAt: 'desc' }
    })

    return <CreateContentClient accounts={accounts} />
}
