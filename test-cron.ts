import 'dotenv/config'
import { prisma } from './lib/prisma'
import { facebookService } from './lib/facebook.service'

async function test() {
    try {
        console.log("Checking posts with IG media ID...");
        const posts = await prisma.post.findMany({
            where: { instagramMediaId: { not: null } },
            include: { connectedAccount: true },
            take: 2,
            orderBy: { createdAt: 'desc' }
        });
        console.log(`Found ${posts.length} posts to sync.`);

        for (const post of posts) {
            console.log(`\nTesting post ${post.id} (IG ID: ${post.instagramMediaId})`);
            if (!post.instagramMediaId || !post.connectedAccount?.pageAccessToken) continue;

            try {
                const insights = await facebookService.getMediaInsights(post.instagramMediaId, post.connectedAccount.pageAccessToken);
                console.log("Insights:", insights);

                if (insights) {
                    await prisma.post.update({
                        where: { id: post.id },
                        data: {
                            views: insights.views,
                            reach: insights.reach,
                            saves: insights.saves,
                            likes: insights.likes
                        }
                    });
                    console.log("Prisma update successful.");
                } else {
                    console.log("Insights were null.");
                }
            } catch (err: any) {
                console.error("Error during processing:", err.message, err);
            }
        }
    } catch (e: any) {
        console.error("Top level error:", e.message, e);
    } finally {
        await prisma.$disconnect();
    }
}
test();
