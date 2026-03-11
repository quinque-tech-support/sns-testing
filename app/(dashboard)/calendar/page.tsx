import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import CalendarClient from './CalendarClient'

export const dynamic = 'force-dynamic'

export default async function CalendarPage() {
    const session = await auth()
    if (!session?.user?.id) {
        redirect('/signin')
    }

    // Fetch all schedules for the user (we pass all and let the client filter by week)
    const schedules = await prisma.schedule.findMany({
        where: {
            post: { userId: session.user.id }
        },
        include: {
            post: {
                include: {
                    connectedAccount: {
                        select: { username: true }
                    }
                }
            }
        },
        orderBy: { scheduledFor: 'asc' }
    })

    // Serialize dates to strings for client component
    const serializedSchedules = schedules.map(s => ({
        id: s.id,
        scheduledFor: s.scheduledFor.toISOString(),
        status: s.status,
        post: {
            id: s.post.id,
            caption: s.post.caption,
            imageUrl: s.post.imageUrl,
            connectedAccount: {
                username: s.post.connectedAccount?.username ?? null
            }
        }
    }))

    return <CalendarClient schedules={serializedSchedules} weekOffset={0} />
}
