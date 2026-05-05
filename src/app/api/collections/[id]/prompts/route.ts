import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteContext) {
    try {

        const session = await getServerAuthSession();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { id } = await params;
        const collectionId = Number(id);

        if (isNaN(collectionId)) {
            return NextResponse.json({ error: "Invalid collection ID" }, { status: 400 });
        }

        const body = await request.json();
        const promptId = Number(body.prompt_id);
        
        if (isNaN(promptId)) {
            return NextResponse.json({ error: "Invalid prompt ID" }, { status: 400 });
        }

        // Get max sort order
        const maxSort = await prisma.collections_prompts.findFirst({
            where: { collection_id: collectionId },
            orderBy: { sort_order: 'desc' }
        });
        const nextSort = maxSort ? maxSort.sort_order + 1 : 0;

        const result = await prisma.$transaction(async (tx) => {
            const newEntry = await tx.collections_prompts.create({
                data: {
                    collection_id: collectionId,
                    prompt_id: promptId,
                    sort_order: nextSort,
                },
            });

            await tx.activity_log.create({
                data: {
                    user_id: Number(session.user.id),
                    action: "ADD_PROMPT_TO_COLLECTION",
                    details: { collectionId, promptId, sort_order: nextSort },
                },
            });

            return newEntry;
        });

        // Fetch prompt details to return for UI update
        const promptData = await prisma.prompts.findUnique({
             where: { id: promptId },
             include: { category: true }
        });

        return NextResponse.json({
            prompt_id: promptId,
            sort_order: nextSort,
            prompt: promptData
        });
    } catch (error: any) {
        if (error.code === 'P2002') {
             return NextResponse.json({ error: "Prompt already in collection" }, { status: 400 });
        }
        console.error("Error adding prompt to collection:", error);
        return NextResponse.json({ error: "Failed to add prompt" }, { status: 500 });
    }
}
