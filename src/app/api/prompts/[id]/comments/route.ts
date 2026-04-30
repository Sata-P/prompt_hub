import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/prompts/[id]/comments
 * ดึงรายการคอมเมนต์ทั้งหมดของ prompt นี้
 */
export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const promptId = Number(id);

    if (isNaN(promptId)) {
      return NextResponse.json({ error: "Invalid prompt ID" }, { status: 400 });
    }

    // ดึงคอมเมนต์หลัก (parent_id เป็น null) พร้อมกับ replies ของมัน
    const comments = await prisma.prompt_comments.findMany({
      where: {
        prompt_id: promptId,
        parent_id: null, // ดึงเฉพาะคอมเมนต์หลัก
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        replies: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy: { created_at: "asc" }, // เรียง replies จากเก่าไปใหม่
        },
      },
      orderBy: { created_at: "desc" }, // เรียงคอมเมนต์หลักจากใหม่ไปเก่า
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/prompts/[id]/comments
 * สร้างคอมเมนต์ใหม่ หรือตอบกลับ (reply)
 * Body: { content: string, parentId?: number }
 */
export async function POST(request: Request, { params }: RouteContext) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const promptId = Number(id);

    if (isNaN(promptId)) {
      return NextResponse.json({ error: "Invalid prompt ID" }, { status: 400 });
    }

    const body = await request.json();
    const { content, parentId } = body;

    if (!content || typeof content !== "string" || content.trim() === "") {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const newComment = await prisma.$transaction(async (tx) => {
      const comment = await tx.prompt_comments.create({
        data: {
          content: content.trim(),
          prompt_id: promptId,
          user_id: Number(session.user.id),
          parent_id: parentId ? Number(parentId) : null,
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      });

      // บันทึก Activity Log
      await tx.activity_log.create({
        data: {
          user_id: Number(session.user.id),
          action: parentId ? "REPLY_COMMENT" : "CREATE_COMMENT",
          details: {
            commentId: comment.id,
            promptId: promptId,
            parentId: parentId || null,
          },
        },
      });

      return comment;
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
