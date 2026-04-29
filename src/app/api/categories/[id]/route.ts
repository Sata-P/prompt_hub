import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { UpdateCategorySchema } from "@/lib/validations/category";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * PATCH /api/categories/[id]
 * Update a category (ADMIN or EDITOR only).
 */
export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role;
    if (userRole !== "ADMIN" && userRole !== "EDITOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const categoryId = Number(id);

    if (isNaN(categoryId)) {
      return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
    }

    const body = await request.json();
    const data = UpdateCategorySchema.parse(body);

    // Check if name conflicts with another category
    if (data.name) {
      const conflict = await prisma.categories.findFirst({
        where: { name: data.name, id: { not: categoryId } },
      });
      if (conflict) {
        return NextResponse.json(
          { error: "Category with this name already exists" },
          { status: 409 }
        );
      }
    }

    const updatedCategory = await prisma.$transaction(async (tx) => {
      const updated = await tx.categories.update({
        where: { id: categoryId },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.color !== undefined && { color: data.color }),
        },
      });

      await tx.activity_log.create({
        data: {
          user_id: Number(session.user.id),
          action: "UPDATE_CATEGORY",
          details: { categoryId: updated.id, name: updated.name },
        },
      });

      return updated;
    });

    return NextResponse.json({ message: "Category updated", category: updatedCategory }, { status: 200 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/categories/[id]
 * Delete a category (only if no prompts are linked to it).
 */
export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role;
    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Only ADMIN can delete categories" }, { status: 403 });
    }

    const { id } = await params;
    const categoryId = Number(id);

    if (isNaN(categoryId)) {
      return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
    }

    // Check if any prompts are linked
    const promptCount = await prisma.prompts.count({
      where: { category_id: categoryId, deleted_at: null },
    });

    if (promptCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete category: ${promptCount} prompt(s) are still linked to it` },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      const deletedCategory = await tx.categories.delete({
        where: { id: categoryId },
      });

      await tx.activity_log.create({
        data: {
          user_id: Number(session.user.id),
          action: "DELETE_CATEGORY",
          details: { categoryId: deletedCategory.id, name: deletedCategory.name },
        },
      });
    });

    return NextResponse.json({ message: "Category deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
