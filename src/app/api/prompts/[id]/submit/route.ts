import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const promptId = Number(id);
    const userId = Number(session.user.id);

    // Fetch the prompt to check ownership and current status
    const prompt = await prisma.prompts.findUnique({
      where: { id: promptId },
    });

    if (!prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    // SECURITY: Only the owner can submit their prompt for review
    if (prompt.owner_id !== userId) {
      return NextResponse.json({ error: "Forbidden: You do not own this prompt" }, { status: 403 });
    }

    // STATE VALIDATION: Only DRAFT or REJECTED prompts can be submitted
    if (prompt.status !== "DRAFT" && prompt.status !== "REJECTED") {
      return NextResponse.json(
        { error: "Only DRAFT or REJECTED prompts can be submitted for review" },
        { status: 400 }
      );
    }

    const userRole = session.user.role;
    const isAdminOrEditor = userRole === "ADMIN" || userRole === "EDITOR";
    const targetStatus = isAdminOrEditor ? "PUBLISHED" : "REVIEW";
    const targetVisibility = isAdminOrEditor ? "PUBLIC" : prompt.visibility;

    // Update status in a transaction to keep version in sync
    const updatedPrompt = await prisma.$transaction(async (tx) => {
      // Find the highest version to submit/publish
      const lastVersion = await tx.prompt_versions.findFirst({
        where: { prompt_id: promptId },
        orderBy: { version_no: "desc" },
      });

      if (!lastVersion) {
        throw new Error("No versions found for this prompt");
      }

      const updateData: any = {
        status: targetStatus,
        visibility: targetVisibility,
      };

      if (targetStatus === "PUBLISHED") {
        updateData.latest_version_no = lastVersion.version_no;
      }

      const p = await tx.prompts.update({
        where: { id: promptId },
        data: updateData,
      });

      // Update the highest version status
      await tx.prompt_versions.update({
        where: { id: lastVersion.id },
        data: { status: targetStatus },
      });

      // Log activity
      await tx.activity_log.create({
        data: {
          user_id: userId,
          action: isAdminOrEditor ? "PUBLISH_PROMPT" : "SUBMIT_PROMPT_REVIEW",
          details: { promptId: promptId, version_no: lastVersion.version_no },
        },
      });

      return p;
    });

    return NextResponse.json(updatedPrompt);
  } catch (error) {
    console.error("Error submitting prompt for review:", error);
    return NextResponse.json({ error: "Failed to submit prompt for review" }, { status: 500 });
  }
}

/**
 * DELETE /api/prompts/[id]/submit
 * Cancel review request and return to DRAFT.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const promptId = Number(id);
    const userId = Number(session.user.id);

    const prompt = await prisma.prompts.findUnique({
      where: { id: promptId },
    });

    if (!prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    // Only owner can cancel review
    if (prompt.owner_id !== userId) {
      return NextResponse.json({ error: "Forbidden: Only the owner can cancel review" }, { status: 403 });
    }

    if (prompt.status !== "REVIEW") {
      return NextResponse.json({ error: "Prompt is not in review" }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.prompts.update({
        where: { id: promptId },
        data: { status: "DRAFT" },
      });

      await tx.prompt_versions.updateMany({
        where: { prompt_id: promptId, version_no: prompt.latest_version_no },
        data: { status: "DRAFT" },
      });

      await tx.activity_log.create({
        data: {
          user_id: userId,
          action: "CANCEL_PROMPT_REVIEW",
          details: { promptId },
        },
      });

      return p;
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error canceling prompt review:", error);
    return NextResponse.json({ error: "Failed to cancel prompt review" }, { status: 500 });
  }
}

