import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { z } from "zod";

const ReviewSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  rejectionReason: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // SECURITY constraint: Only EDITOR and ADMIN roles can hit this endpoint
    const userRole = session.user.role;
    if (userRole !== "ADMIN" && userRole !== "EDITOR") {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    const body = await request.json();
    const { action, rejectionReason } = ReviewSchema.parse(body);
    const promptId = Number(id);
    const userId = Number(session.user.id);

    // Fetch the prompt
    const prompt = await prisma.prompts.findUnique({
      where: { id: promptId },
    });

    if (!prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    // STATE VALIDATION: Only prompts in REVIEW status can be approved or rejected
    if (prompt.status !== "REVIEW") {
      return NextResponse.json({ error: "Prompt is not currently in review" }, { status: 400 });
    }

    let updatedStatus: "PUBLISHED" | "REJECTED";
    let updatedVisibility = prompt.visibility;

    if (action === "APPROVE") {
      updatedStatus = "PUBLISHED";
      updatedVisibility = "PUBLIC"; // Auto-publish to public on approval
    } else {
      updatedStatus = "REJECTED";
      // Visibility remains PRIVATE
    }

    const result = await prisma.$transaction(async (tx) => {
      let latestVersionNo = prompt.latest_version_no;

      if (updatedStatus === "PUBLISHED") {
        // Get the highest version number to publish it
        const lastVersion = await tx.prompt_versions.findFirst({
          where: { prompt_id: promptId },
          orderBy: { version_no: "desc" },
        });

        if (lastVersion) {
          latestVersionNo = lastVersion.version_no;
          
          // Update the specific version status to PUBLISHED
          await tx.prompt_versions.update({
            where: { id: lastVersion.id },
            data: { status: "PUBLISHED" },
          });
        }
      } else {
        // For REJECTED, just sync the current latest_version_no status
        await tx.prompt_versions.updateMany({
          where: { prompt_id: promptId, version_no: prompt.latest_version_no },
          data: { status: updatedStatus },
        });
      }

      // Update prompt
      const p = await tx.prompts.update({
        where: { id: promptId },
        data: {
          status: updatedStatus,
          visibility: updatedVisibility,
          latest_version_no: latestVersionNo,
        },
      });

      // Log activity
      await tx.activity_log.create({
        data: {
          user_id: userId,
          action: action === "APPROVE" ? "APPROVE_PROMPT" : "REJECT_PROMPT",
          details: { 
            promptId: promptId,
            ...(action === "REJECT" && rejectionReason && { rejectionReason })
          },
        },
      });

      return p;
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid action", details: error.issues }, { status: 400 });
    }
    console.error("Error reviewing prompt:", error);
    return NextResponse.json({ error: "Failed to review prompt" }, { status: 500 });
  }
}
