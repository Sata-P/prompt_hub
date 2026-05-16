import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { UpdateVersionSchema } from "@/lib/validations/promptVersion";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string; versionId: string }> };

/**
 * GET /api/prompts/[id]/versions/[versionId]
 * Get a single version with its variables.
 */
export async function GET(request: Request, { params }: RouteContext) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, versionId } = await params;
    const promptId = Number(id);
    const vId = Number(versionId);

    if (isNaN(promptId) || isNaN(vId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const version = await prisma.prompt_versions.findFirst({
      where: {
        id: vId,
        prompt_id: promptId,
        prompt: { deleted_at: null },
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        promptVariables: { orderBy: { sort_order: "asc" } },
      },
    });

    if (!version) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    return NextResponse.json(version);
  } catch (error) {
    console.error("Error fetching version:", error);
    return NextResponse.json(
      { error: "Failed to fetch version" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/prompts/[id]/versions/[versionId]
 * Update a version (only allowed if status is DRAFT).
 */
export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, versionId } = await params;
    const promptId = Number(id);
    const vId = Number(versionId);
    const userId = Number(session.user.id);

    if (isNaN(promptId) || isNaN(vId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const data = UpdateVersionSchema.parse(body);

    // Verify version exists and is editable
    const existing = await prisma.prompt_versions.findFirst({
      where: {
        id: vId,
        prompt_id: promptId,
        prompt: { deleted_at: null },
      },
      include: {
        prompt: { select: { owner_id: true } },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    if (existing.prompt.owner_id !== userId && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (existing.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Only DRAFT versions can be edited" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update version content
      const updated = await tx.prompt_versions.update({
        where: { id: vId },
        data: {
          ...(data.templateContent !== undefined && {
            template_content: data.templateContent,
          }),
          ...(data.systemPrompt !== undefined && {
            system_prompt: data.systemPrompt,
          }),
          ...(data.outputFormat !== undefined && {
            output_format: data.outputFormat,
          }),
          ...(data.changelog !== undefined && {
            changelog: data.changelog,
          }),
        },
      });

      // Update variables if provided
      if (data.variables !== undefined) {
        // Remove existing variables to prevent unique constraint violation
        await tx.prompt_variables.deleteMany({
          where: { prompt_id: promptId },
        });

        // Create new variables
        if (data.variables.length > 0) {
          await tx.prompt_variables.createMany({
            data: data.variables.map((v, i) => ({
              prompt_id: promptId,
              prompt_version_id: vId,
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
      }

      return updated;
    });

    // Fetch full version with relations
    const fullVersion = await prisma.prompt_versions.findUnique({
      where: { id: result.id },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        promptVariables: { orderBy: { sort_order: "asc" } },
      },
    });

    return NextResponse.json(fullVersion);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating version:", error);
    return NextResponse.json({
      error: "Failed to update version"
    }, {
      status: 500
    });
  }
}

/**
 * DELETE /api/prompts/[id]/versions/[versionId]
 * Delete a specific version of a prompt.
 * Cannot delete the only version of a prompt.
 */
export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, versionId } = await params;
    const promptId = Number(id);
    const vId = Number(versionId);
    const userId = Number(session.user.id);
    const userRole = session.user.role;

    if (isNaN(promptId) || isNaN(vId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // Check version existence and total count
    const versionToDelete = await prisma.prompt_versions.findFirst({
      where: { id: vId, prompt_id: promptId },
      include: { prompt: true }
    });

    if (!versionToDelete) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    // Permission check: Owner, Admin, or Editor
    const isOwner = versionToDelete.prompt.owner_id === userId;
    const isAdminOrEditor = userRole === "ADMIN" || userRole === "EDITOR";
    if (!isOwner && !isAdminOrEditor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const totalVersions = await prisma.prompt_versions.count({
      where: { prompt_id: promptId }
    });

    if (totalVersions <= 1) {
      return NextResponse.json({ error: "Cannot delete the only version of a prompt. Delete the prompt instead." }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Delete variables associated with this version
      await tx.prompt_variables.deleteMany({
        where: { prompt_version_id: vId }
      });

      // 2. Delete the version
      await tx.prompt_versions.delete({
        where: { id: vId }
      });

      // 3. Update prompt's latest_version_no if we deleted the current latest
      if (versionToDelete.version_no === versionToDelete.prompt.latest_version_no) {
        const remainingLatest = await tx.prompt_versions.findFirst({
          where: { prompt_id: promptId },
          orderBy: { version_no: "desc" },
          select: { version_no: true }
        });
        
        if (remainingLatest) {
          await tx.prompts.update({
            where: { id: promptId },
            data: { latest_version_no: remainingLatest.version_no }
          });
        }
      }

      // Log activity
      await tx.activity_log.create({
        data: {
          user_id: userId,
          action: "DELETE_VERSION",
          details: {
            promptId,
            versionId: vId,
            versionNo: versionToDelete.version_no,
          }
        }
      });
    });

    return NextResponse.json({ message: "Version deleted successfully" });
  } catch (error) {
    console.error("Error deleting version:", error);
    return NextResponse.json({ error: "Failed to delete version" }, { status: 500 });
  }
}
