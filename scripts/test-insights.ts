import { prisma } from '../lib/prisma'
import { facebookService } from '../lib/facebook.service'

async function testInsights() {
    console.log("Fetching posts with instagramMediaId...")
    const posts = await prisma.post.findMany({
        where: { instagramMediaId: { not: null } },
        include: { connectedAccount: true },
        take: 1,
        orderBy: { createdAt: 'desc' }
    })

    if (posts.length === 0) {
        console.log("No posts found with instagramMediaId.")
        return
    }

    const post = posts[0]
    console.log(`Found post: ${post.id}, IG Media ID: ${post.instagramMediaId}`)

    if (!post.connectedAccount?.pageAccessToken) {
        console.log("No page access token found for the connected account.")
        return
    }

    try {
        console.log("Fetching insights...")
        const insights = await facebookService.getMediaInsights(post.instagramMediaId!, post.connectedAccount.pageAccessToken)
        console.log("Insights fetched:", insights)

        if (insights) {
            console.log("Updating Prisma...")
            const updated = await prisma.post.update({
                where: { id: post.id },
                data: {
                    views: insights.views,
                    reach: insights.reach,
                    saves: insights.saves
                }
            })
            console.log("Prisma updated successfully:", {
                views: updated.views,
                reach: updated.reach,
                saves: updated.saves
            })
        }
    } catch (e) {
        console.error("Error during test:", e)
    }
}

testInsights()
    .then(() => prisma.$disconnect())
    .catch(e => {
        console.error(e)
        prisma.$disconnect()
    })
