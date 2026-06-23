import { requirePageAuth } from '@/lib/auth.utils'
import FollowManagerClient from './FollowManagerClient'

export const dynamic = 'force-dynamic'

export default async function FollowManagerPage() {
    await requirePageAuth();
    return <FollowManagerClient />
}
