import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { CreateVersionSchema } from "@/lib/validations/promptVersion";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/prompts/[id]/versions
 * List all versions of a prompt, ordered by version number descending.
 */
export async function GET(request: Request, { params }: RouteContext) {
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

    // Verify prompt exists
    const prompt = await prisma.prompts.findUnique({
      where: { id: promptId, deleted_at: null },
      select: { id: true, owner_id: true },
    });

    if (!prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    const versions = await prisma.prompt_versions.findMany({
      where: { prompt_id: promptId },
      orderBy: { version_no: "desc" },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        promptVariables: {
          orderBy: { sort_order: "asc" },
        },
      },
    });

    return NextResponse.json(versions);
  } catch (error) {
    console.error("Error fetching versions:", error);
    return NextResponse.json(
      { error: "Failed to fetch versions" },
      { status: 500 }
    );
  }
}



/**
 * POST /api/prompts/[id]/versions
 * Create a new version for a prompt.
 * Auto-increments version_no based on the latest existing version.
 */
export async function POST(request: Request, { params }: RouteContext) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const promptId = Number(id);
    const userId = Number(session.user.id);

    if (isNaN(promptId)) {
      return NextResponse.json({ error: "Invalid prompt ID" }, { status: 400 });
    }

    const body = await request.json();
    const data = CreateVersionSchema.parse(body);

    // Verify prompt exists and user has permission
    const prompt = await prisma.prompts.findUnique({
      where: { id: promptId, deleted_at: null },
      select: { id: true, owner_id: true, latest_version_no: true, status: true },
    });

    if (!prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    if (prompt.owner_id !== userId && session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userRole = session.user.role;
    const isAdminOrEditor = userRole === "ADMIN" || userRole === "EDITOR";

    const result = await prisma.$transaction(async (tx) => {
      // Get the highest version number regardless of status
      const lastVersion = await tx.prompt_versions.findFirst({
        where: { prompt_id: promptId },
        orderBy: { version_no: "desc" },
      });

      const currentHighestVersionNo = lastVersion?.version_no ?? 0;

      // Always create a new version
      const newVersionNo = currentHighestVersionNo + 1;
      const version = await tx.prompt_versions.create({
        data: {
          prompt_id: promptId,
          version_no: newVersionNo,
          template_content: data.templateContent,
          system_prompt: data.systemPrompt ?? null,
          output_format: data.outputFormat ?? null,
          changelog: data.changelog ?? null,
          created_by: userId,
          status: "DRAFT", // Always start new versions as DRAFT
        },
      });

      // Create variables for this version
      if (data.variables && data.variables.length > 0) {
        await tx.prompt_variables.createMany({
          data: data.variables.map((v, i) => ({
            prompt_id: promptId,
            prompt_version_id: version.id,
            name: v.name,
            label: v.label,
            type: v.type,
            is_required: v.isRequired ?? false,
            default_value: v.defaultValue ?? null,
            placeholder: v.placeholder ?? null,
            description: v.description ?? null,
            options_json: v.optionsJson ?? null,
            sort_order: v.sortOrder ?? i,
          })),
        });
      }

      // Update prompt status only if NOT PUBLISHED. 
      // DO NOT update latest_version_no yet (it happens on Publish)
      if (prompt.status !== "PUBLISHED") {
        await tx.prompts.update({
          where: { id: promptId },
          data: { 
            status: "DRAFT",
            visibility: "PRIVATE"
          },
        });
      }

      return version;
    });

    // Fetch with relations
    const fullVersion = await prisma.prompt_versions.findUnique({
      where: { id: result.id },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        promptVariables: { orderBy: { sort_order: "asc" } },
      },
    });

    return NextResponse.json(fullVersion, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating version:", error);
    return NextResponse.json(
      { error: "Failed to create version" },
      { status: 500 }
    );
  }
}
