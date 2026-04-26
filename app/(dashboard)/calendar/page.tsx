import { requirePageAuth } from '@/lib/auth.utils'
import { prisma } from '@/lib/prisma'
import CalendarClient from './CalendarClient'

export const dynamic = 'force-dynamic'

export default async function CalendarPage() {
    const session = await requirePageAuth();
    const userId = session.user.id

    // Fetch all schedules for the user (we pass all and let the client filter by week)
    const schedules = await prisma.schedule.findMany({
        where: {
            post: { userId: userId }
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
