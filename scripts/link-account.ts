import "dotenv/config"
import { prisma } from '../lib/prisma'
import readline from 'readline'

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const question = (query: string): Promise<string> => {
    return new Promise((resolve) => rl.question(query, resolve))
}

async function main() {
    console.log("==========================================")
    console.log("  Manual Instagram Account Linker Helper  ")
    console.log("==========================================")

    // 1. Get the first user (we assume there's only one user for local testing right now)
    const users = await prisma.user.findMany()

    if (users.length === 0) {
        console.error("❌ No users found in the database. Please sign up in the UI first.")
        process.exit(1)
    }

    const user = users[2]
    console.log(`\nFound User: ${user.email} (ID: ${user.id})`)

    const proceed = await question("Do you want to link an Instagram account to this user? (y/n): ")
    if (proceed.toLowerCase() !== 'y') {
        console.log("Aborting.")
        process.exit(0)
    }

    // 2. Gather Instagram info
    console.log("\n--- Instagram Details ---")
    console.log("To get these, use the Facebook Graph API Explorer (https://developers.facebook.com/tools/explorer)")

    const pageId = await question("Facebook Page ID: ")
    const facebookUserId = await question("Facebook User ID: ")
    const instagramBusinessId = await question("Instagram Business Account / IG User ID (usually a long number): ")
    const pageAccessToken = await question("Facebook Graph API Page Access Token: ")
    const longLivedUserToken = await question("Facebook Graph API Long Lived User Token: ")

    if (!pageId || !instagramBusinessId || !pageAccessToken || !facebookUserId || !longLivedUserToken) {
        console.error("❌ All fields are required.")
        process.exit(1)
    }

    try {
        // 3. Upsert into database
        const account = await prisma.connectedAccount.upsert({
            where: {
                userId_pageId: {
                    userId: user.id,
                    pageId: pageId
                }
            },
            update: {
                facebookUserId,
                instagramBusinessId,
                pageAccessToken,
                longLivedUserToken,
                tokenExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days mock
            },
            create: {
                userId: user.id,
                facebookUserId,
                pageId,
                instagramBusinessId,
                pageAccessToken,
                longLivedUserToken,
                tokenExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days mock
            }
        })

        console.log("\n✅ Successfully linked Instagram account as ConnectedAccount!")
        console.log(`Database ID: ${account.id}`)
        console.log(`You can now use this account to test the worker.`)
    } catch (error) {
        console.error("❌ Failed to save account:", error)
    } finally {
        rl.close()
    }
}

main().catch(console.error)
