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

        const { caption, imageUrl } = validation.data

        const post = await prisma.post.create({
            data: {
                userId: session.user.id,
                caption,
                imageUrl,
            },
        })

        return NextResponse.json(post, { status: 201 })
    } catch (error) {
        console.error("[POSTS_POST]", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
