import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { sanitizeCommentHtml } from "@/lib/sanitize";

const MAX_COMMENT_BYTES = 50_000;

type RouteContext = { params: Promise<{ id: string }> };

/**
 * DELETE /api/comments/[id]
 * ลบคอมเมนต์ (เจ้าของคอมเมนต์ หรือ ADMIN สามารถลบได้)
 */
export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const commentId = Number(id);
    const userId = Number(session.user.id);
    const userRole = session.user.role;

    if (isNaN(commentId)) {
      return NextResponse.json({ error: "Invalid comment ID" }, { status: 400 });
    }

    // ดึงข้อมูลคอมเมนต์มาเช็คสิทธิ์
    const comment = await prisma.prompt_comments.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // เฉพาะเจ้าของ หรือ ADMIN/EDITOR ถึงลบได้
    if (comment.user_id !== userId && userRole !== "ADMIN" && userRole !== "EDITOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.prompt_comments.delete({
        where: { id: commentId },
      });

      // บันทึก Activity Log
      await tx.activity_log.create({
        data: {
          user_id: userId,
          action: "DELETE_COMMENT",
          details: {
            commentId: comment.id,
            promptId: comment.prompt_id,
            deletedByRole: userRole,
          },
        },
      });
    });

    return NextResponse.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/comments/[id]
 * แก้ไขเนื้อหาคอมเมนต์ (เจ้าของเท่านั้น)
 */
export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const commentId = Number(id);
    const userId = Number(session.user.id);

    if (isNaN(commentId)) {
      return NextResponse.json({ error: "Invalid comment ID" }, { status: 400 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== "string" || content.trim() === "") {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }
    if (content.length > MAX_COMMENT_BYTES) {
      return NextResponse.json({ error: "Content too large" }, { status: 413 });
    }
    const safeContent = sanitizeCommentHtml(content).trim();
    if (!safeContent || safeContent === "<p></p>") {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const comment = await prisma.prompt_comments.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // เฉพาะเจ้าของคอมเมนต์ถึงแก้ได้
    if (comment.user_id !== userId) {
      return NextResponse.json({ error: "Forbidden: You can only edit your own comments" }, { status: 403 });
    }

    const updatedComment = await prisma.$transaction(async (tx) => {
      const updated = await tx.prompt_comments.update({
        where: { id: commentId },
        data: { content: safeContent },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      });

      await tx.activity_log.create({
        data: {
          user_id: userId,
          action: "UPDATE_COMMENT",
          details: {
            commentId: comment.id,
            promptId: comment.prompt_id,
          },
        },
      });

      return updated;
    });

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json(
      { error: "Failed to update comment" },
      { status: 500 }
    );
  }
}
