import "dotenv/config"
import { prisma } from '../lib/prisma'

async function main() {
    console.log("==========================================")
    console.log("     Creating Test Post & Schedule      ")
    console.log("==========================================")

    // Get the user and their newly linked Instagram account
    const account = await prisma.instagramAccount.findFirst({
        include: { user: true }
    })

    if (!account) {
        console.error("❌ No Instagram account found in the database. Run link-account.ts first.")
        process.exit(1)
    }

    console.log(`Using Instagram Account: ${account.username} (ID: ${account.id})`)

    // Schedule for 10 seconds in the past so the worker picks it up IMMEDIATELY
    const scheduledTime = new Date(Date.now() - 10000)

    try {
        const post = await prisma.post.create({
            data: {
                userId: account.userId,
                instagramAccountId: account.id,
                caption: "Hello world! This is an automated test post from my new script 🚀🌟 #InstaAutoTest",
                // Using a reliable sample image URL
                imageUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop",
                schedules: {
                    create: {
                        scheduledFor: scheduledTime,
                        status: "PENDING"
                    }
                }
            },
            include: {
                schedules: true
            }
        })

        console.log("\n✅ Successfully created Post and Schedule!")
        console.log(`Post ID: ${post.id}`)
        console.log(`Schedule Status: ${post.schedules[0].status}`)
        console.log(`\nNext Step: Run your worker!`)
        console.log(`npx tsx scripts/worker.ts`)

    } catch (error) {
        console.error("❌ Failed to create test post:", error)
    }
}

main().catch(console.error)
