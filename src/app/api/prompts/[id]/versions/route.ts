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
      select: { id: true, owner_id: true, status: true },
    });

    if (!prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    const userId = Number(session.user.id);
    const userRole = session.user.role?.toUpperCase();
    const isAdminOrEditor = userRole === "ADMIN" || userRole === "EDITOR";
    const isOwner = prompt.owner_id === userId;

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

    // Filter versions based on status
    const visibleVersions = versions.filter(v => {
      const vs = v.status.toUpperCase();
      if (vs === "PUBLISHED") return true;
      if (vs === "REVIEW") return isOwner || isAdminOrEditor;
      return isOwner; // DRAFT/REJECTED/ARCHIVED/etc: Only owner
    });

    // If user has no access to any version, return 404
    if (visibleVersions.length === 0) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    return NextResponse.json(visibleVersions);
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

    // Lock check: Only allow Admin/Editor to bypass "REVIEW" lock
    if (prompt.status === "REVIEW" && session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
      return NextResponse.json({ 
        error: "Prompt is under review and cannot be updated. Please cancel review first if you need to make changes." 
      }, { status: 403 });
    }

    const userRole = session.user.role;
    const isAdminOrEditor = userRole === "ADMIN" || userRole === "EDITOR";
    const newVersionNo = prompt.latest_version_no + 1;

    const result = await prisma.$transaction(async (tx) => {
      // Check if the latest version is already a DRAFT or in REVIEW
      // If it is, we might want to update it instead of creating a new version number
      // OR if it's in REVIEW, we revert it to DRAFT because it has been edited.
      const latestVersion = await tx.prompt_versions.findFirst({
        where: { prompt_id: promptId, version_no: prompt.latest_version_no },
      });

      if (latestVersion && (latestVersion.status === "DRAFT" || latestVersion.status === "REVIEW" || latestVersion.status === "REJECTED")) {
        // Update current version instead of creating a new one
        const updatedVersion = await tx.prompt_versions.update({
          where: { id: latestVersion.id },
          data: {
            template_content: data.templateContent,
            system_prompt: data.systemPrompt ?? null,
            output_format: data.outputFormat ?? null,
            changelog: data.changelog ?? null,
            created_by: userId,
            // Only reset to DRAFT if NOT admin/editor
            ...(!isAdminOrEditor && { status: "DRAFT" }),
          },
        });

        // Delete old variables for this version
        await tx.prompt_variables.deleteMany({
          where: { prompt_version_id: updatedVersion.id },
        });

        // Re-create variables
        if (data.variables && data.variables.length > 0) {
          await tx.prompt_variables.createMany({
            data: data.variables.map((v, i) => ({
              prompt_id: promptId,
              prompt_version_id: updatedVersion.id,
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

        // Ensure prompt status is DRAFT (only if NOT admin/editor)
        if (!isAdminOrEditor) {
          await tx.prompts.update({
            where: { id: promptId },
            data: { 
              status: "DRAFT",
              visibility: "PRIVATE" 
            },
          });
        }

        await tx.activity_log.create({
          data: {
            user_id: userId,
            action: "UPDATE_VERSION",
            details: {
              promptId,
              versionId: updatedVersion.id,
              versionNo: updatedVersion.version_no,
            }
          }
        });

        return updatedVersion;
      }

      // Otherwise (if latest was PUBLISHED or ARCHIVED), create a truly new version
      const version = await tx.prompt_versions.create({
        data: {
          prompt_id: promptId,
          version_no: newVersionNo,
          template_content: data.templateContent,
          system_prompt: data.systemPrompt ?? null,
          output_format: data.outputFormat ?? null,
          changelog: data.changelog ?? null,
          created_by: userId,
          // If admin/editor, auto-publish the new version if the prompt was published
          status: isAdminOrEditor ? "PUBLISHED" : "DRAFT",
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

      // Update prompt's latest_version_no and status
      await tx.prompts.update({
        where: { id: promptId },
        data: { 
          latest_version_no: newVersionNo,
          // Only reset to DRAFT if NOT admin/editor
          ...(!isAdminOrEditor && {
            status: "DRAFT",
            visibility: "PRIVATE"
          }),
        },
      });

      await tx.activity_log.create({
        data: {
          user_id: userId,
          action: "CREATE_VERSION",
          details: {
            promptId,
            versionId: version.id,
            versionNo: version.version_no,
          }
        }
      });

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
