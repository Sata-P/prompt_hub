import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string; versionId: string }> };

/**
 * POST /api/prompts/[id]/versions/[versionId]/review
 * Approve or Reject a prompt version.
 * Body: { action: "APPROVE" | "REJECT" }
 */
export async function POST(request: Request, { params }: RouteContext) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = session;
    if (user.role !== "ADMIN" && user.role !== "EDITOR") {
      return NextResponse.json({ error: "Forbidden: Only Admin or Editor can review versions" }, { status: 403 });
    }

    const { id, versionId } = await params;
    const promptId = Number(id);
    const vId = Number(versionId);

    if (isNaN(promptId) || isNaN(vId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const { action } = body;

    if (action !== "APPROVE" && action !== "REJECT") {
      return NextResponse.json({ error: "Invalid action. Use 'APPROVE' or 'REJECT'" }, { status: 400 });
    }

    const version = await prisma.prompt_versions.findFirst({
      where: {
        id: vId,
        prompt_id: promptId,
      },
    });

    if (!version) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    if (version.status !== "REVIEW") {
      return NextResponse.json({ error: "Only versions in 'REVIEW' status can be reviewed" }, { status: 400 });
    }

    const newStatus = action === "APPROVE" ? "PUBLISHED" : "REJECTED";

    const updated = await prisma.$transaction(async (tx) => {
      const v = await tx.prompt_versions.update({
        where: { id: vId },
        data: { status: newStatus },
      });

      // Update the prompt status as well
      await tx.prompts.update({
        where: { id: promptId },
        data: { 
          status: newStatus,
          ...(newStatus === "PUBLISHED" && { visibility: "PUBLIC" })
        },
      });

      // Log activity
      await tx.activity_log.create({
        data: {
          user_id: Number(user.id),
          action: action === "APPROVE" ? "APPROVE_VERSION" : "REJECT_VERSION",
          details: {
            promptId,
            versionId: vId,
            versionNo: version.version_no,
            result: newStatus,
          },
        },
      });

      return v;
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error reviewing version:", error);
    return NextResponse.json({ error: "Failed to review version" }, { status: 500 });
  }
}
