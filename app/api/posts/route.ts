import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { createPostSchema } from "@/lib/validation"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        let body;
        try {
            body = await req.json()
        } catch (error) {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
        }

        const validation = createPostSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json({
                error: "Invalid request body",
                details: validation.error.flatten().fieldErrors
            }, { status: 400 })
        }

        const { caption, imageUrl, scheduledAt } = validation.data

        // --- Prevent duplicates / Race conditions ---
        // Block exact same image from the same user within 1 minute
        const oneMinuteAgo = new Date(Date.now() - 60 * 1000)

        const existingRecentPost = await prisma.post.findFirst({
            where: {
                userId: session.user.id,
                imageUrl,
                createdAt: {
                    gte: oneMinuteAgo
                }
            }
        })

        if (existingRecentPost) {
            return NextResponse.json(
                { error: "Duplicate post detected. Please wait before posting the same content again." },
                { status: 429 } // 429 Too Many Requests
            )
        }
        // ---------------------------------------------

        const post = await prisma.post.create({
            data: {
                userId: session.user.id,
                caption,
                imageUrl,
                ...(scheduledAt && {
                    schedules: {
                        create: {
                            scheduledFor: new Date(scheduledAt),
                        },
                    },
                }),
            },
        })

        return NextResponse.json(post, { status: 201 })
    } catch (error) {
        console.error("[POSTS_POST]", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
