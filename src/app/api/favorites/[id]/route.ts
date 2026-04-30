import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";


type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, { params }: RouteContext) {
    try {
        const session = await getServerAuthSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const promptId = Number(id); // id ที่รับมาจริงๆ คือ prompt_id

        if (isNaN(promptId)) {
            return NextResponse.json({ error: "Invalid prompt ID" }, { status: 400 });
        }

        // ลบโดยใช้ unique key (user_id + prompt_id) แทน favorites.id

        const unfav = await prisma.$transaction(async(tx)=>{
            
           const deletefav = await prisma.favorites.deleteMany({
                where: {
                    user_id: Number(session.user.id),
                    prompt_id: promptId,
                },
            });

            await tx.activity_log.create({
                data:{
                    user_id: Number(session.user.id),
                    action:"UNFAVORITE_PROMPT",
                    details:{   
                        prompt: promptId,
                    }
                }
            })
            return deletefav; 
        });
        return NextResponse.json({ message: "Favorite deleted successfully" ,deletefav : unfav},{ status: 201});
    } catch (error) {
        console.error("Error deleting favorite:", error);
        return NextResponse.json(
            { error: "Failed to delete favorite" },
            { status: 500 }
        );
    }
}
