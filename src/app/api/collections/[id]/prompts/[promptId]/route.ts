import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string; promptId: string }> };

export async function DELETE(request: Request, { params }: RouteContext) {
    try {
        const session = await getServerAuthSession();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { id, promptId } = await params;
        const collectionId = Number(id);
        const pId = Number(promptId);

        if (isNaN(collectionId)) {
            return NextResponse.json({ error: "Invalid collection ID" }, { status: 400 });
        }

        if (isNaN(pId)) {
            return NextResponse.json({ error: "Invalid prompt ID" }, { status: 400 });
        }

        await prisma.$transaction(async (tx) => {
            await tx.collections_prompts.delete({
                where: {
                    collection_id_prompt_id: {
                        collection_id: collectionId,
                        prompt_id: pId,
                    },
                },
            });

            await tx.activity_log.create({
                data: {
                    user_id: Number(session.user.id),
                    action: "REMOVE_PROMPT_FROM_COLLECTION",
                    details: { collectionId, promptId: pId },
                },
            });
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.code === 'P2025') {
             return NextResponse.json({ error: "Prompt not found in collection" }, { status: 404 });
        }
        console.error("Error removing prompt from collection:", error);
        return NextResponse.json({ error: "Failed to remove prompt" }, { status: 500 });
    }
}
