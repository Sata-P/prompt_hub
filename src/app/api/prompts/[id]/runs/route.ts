import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";

/**
 * GET /api/prompts/[id]/runs
 * Returns the latest successful runs for a given prompt.
 * Query params:
 *   - limit: number (default 5)
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const promptId = Number(params.id);
    if (isNaN(promptId)) {
      return NextResponse.json({ error: "Invalid prompt ID" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit") || "5"), 20);

    // Ensure prompt exists and user has access
    const prompt = await prisma.prompts.findUnique({
      where: { id: promptId, deleted_at: null },
      select: { id: true, owner_id: true, visibility: true },
    });

    if (!prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    const userId = Number(session.user.id);
    const userRole = session.user.role;
    const isOwner = prompt.owner_id === userId;
    const isPublic = prompt.visibility === "PUBLIC";
    const isPrivileged = userRole === "ADMIN" || userRole === "EDITOR";

    if (!isOwner && !isPublic && !isPrivileged) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const runs = await prisma.prompt_run.findMany({
      where: {
        prompt_id: promptId,
        status: "SUCCESS",
      },
      orderBy: { created_at: "desc" },
      take: limit,
      select: {
        id: true,
        model: true,
        output_response: true,
        execution_time_ms: true,
        token_used: true,
        variables_input: true,
        created_at: true,
        prompt_version: {
          select: { version_no: true },
        },
        user: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json(runs);
  } catch (error) {
    console.error("Error fetching prompt runs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
