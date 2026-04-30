import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { UpdatePromptSchema, UpdatePromptStatusSchema } from "@/lib/validations/prompt";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/prompts/[id]
 * Get a single prompt with all relations.
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

    const prompt = await prisma.prompts.findUnique({
      where: { id: promptId, deleted_at: null },
      include: {
        category: { select: { id: true, name: true, color: true } },
        owner: { select: { id: true, name: true, email: true } },
        tags: {
          include: {
            tag: { select: { id: true, name: true } },
          },
        },
        versions: {
          orderBy: { version_no: "desc" },
          include: {
            promptVariables: {
              orderBy: { sort_order: "asc" },
            },
            creator: { select: { id: true, name: true } },
          },
        },
        variables: {
          orderBy: { sort_order: "asc" },
        },
      },
    });

    if (!prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    // Format response
    const formatted = {
      ...prompt,
      tags: prompt.tags.map((pt) => pt.tag),
    };

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching prompt:", error);
    return NextResponse.json(
      { error: "Failed to fetch prompt" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/prompts/[id]
 * Update prompt metadata or status.
 * 
 * Body can contain:
 *   - metadata fields (title, description, categoryId, etc.) via UpdatePromptSchema
 *   - OR status change via { status: "..." }
 */
export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const promptId = Number(id);
    const userId = Number(session.user.id);
    const userRole = session.user.role;

    if (isNaN(promptId)) {
      return NextResponse.json({ error: "Invalid prompt ID" }, { status: 400 });
    }

    // Check prompt exists and user has permission
    const existing = await prisma.prompts.findUnique({
      where: { id: promptId, deleted_at: null },
    });

    if (!existing) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    if (existing.owner_id !== userId && userRole !== "ADMIN" && userRole !== "EDITOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    if (body.status && Object.keys(body).length === 1) {
      const { status } = UpdatePromptStatusSchema.parse(body);

      const updateData: any = { status };
      if (status === "PUBLISHED") {
        updateData.visibility = "PUBLIC";
      }

      const updatedPrompt = await prisma.$transaction(async (tx) => {
        const updated = await tx.prompts.update({
          where: { id: promptId },
          data: updateData,
        });

        await tx.activity_log.create({
          data: {
            user_id: userId,
            action: "UPDATE_PROMPT_STATUS",
            details: {
              promptId,
              title: existing.title,
              previousStatus: existing.status,
              newStatus: status,
              ...(status === "PUBLISHED" && { visibility: "PUBLIC" }),
            },
          },
        });

        return updated;
      });

      return NextResponse.json(updatedPrompt);
    }

    // Otherwise update metadata
    const data = UpdatePromptSchema.parse(body);

    const result = await prisma.$transaction(async (tx) => {
      // Update tags if provided
      if (data.tags !== undefined) {
        // Remove existing tags
        await tx.prompt_tags.deleteMany({
          where: { prompt_id: promptId },
        });

        // Add new tags
        if (data.tags.length > 0) {
          const tagRecords: { id: number }[] = [];
          for (const tagName of data.tags) {
            const tag = await tx.tags.upsert({
              where: { name: tagName },
              create: { name: tagName },
              update: {},
            });
            tagRecords.push({ id: tag.id });
          }

          await tx.prompt_tags.createMany({
            data: tagRecords.map((t) => ({
              prompt_id: promptId,
              tag_id: t.id,
            })),
          });
        }
      }

      // Update prompt
      const updated = await tx.prompts.update({
        where: { id: promptId },
        data: {
          ...(data.title !== undefined && { title: data.title }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.categoryId !== undefined && { category_id: data.categoryId }),
          ...(data.recommendedModel !== undefined && { recommended_model: data.recommendedModel }),
          ...(data.visibility !== undefined && { visibility: data.visibility }),
          ...(data.isTemplateActive !== undefined && { is_template_active: data.isTemplateActive }),
        },
        include: {
          category: { select: { id: true, name: true, color: true } },
          owner: { select: { id: true, name: true, email: true } },
          tags: { include: { tag: { select: { id: true, name: true } } } },
        },
      });

      await tx.activity_log.create({
        data: {
          user_id: userId,
          action: "UPDATE_PROMPT",
          details: {
            promptId,
            title: updated.title,
            changedFields: Object.keys(data).filter(
              (k) => (data as Record<string, unknown>)[k] !== undefined
            ),
          },
        },
      });

      return updated;
    });

    const formatted = {
      ...result,
      tags: result.tags.map((pt) => pt.tag),
    };

    return NextResponse.json(formatted);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating prompt:", error);
    return NextResponse.json(
      { error: "Failed to update prompt" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/prompts/[id]
 * Soft delete a prompt (sets deleted_at timestamp).
 */
export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const promptId = Number(id);
    const userId = Number(session.user.id);
    const userRole = session.user.role;

    if (isNaN(promptId)) {
      return NextResponse.json({ error: "Invalid prompt ID" }, { status: 400 });
    }

    const existing = await prisma.prompts.findUnique({
      where: { id: promptId, deleted_at: null },
    });

    if (!existing) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    if (existing.owner_id !== userId && userRole !== "ADMIN" && userRole !== "EDITOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const deleted = await prisma.$transaction(async (tx) => {
      const softDeleted = await tx.prompts.update({
        where: { id: promptId },
        data: { deleted_at: new Date() },
      });

      await tx.activity_log.create({
        data: {
          user_id: userId,
          action: "DELETE_PROMPT",
          details: {
            promptId: softDeleted.id,
            title: softDeleted.title,
            deletedByRole: userRole,
          },
        },
      });

      return softDeleted;
    });

    return NextResponse.json({ message: "Prompt deleted successfully", id: deleted.id });
  } catch (error) {
    console.error("Error deleting prompt:", error);
    return NextResponse.json(
      { error: "Failed to delete prompt" },
      { status: 500 }
    );
  }
}
