import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { CreateCategorySchema } from "@/lib/validations/category";
import { z } from "zod";


/**
 * GET /api/categories
 * List all categories.
 */
export async function GET() {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const categories = await prisma.categories.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { prompts: true },
        },
      },
    });

    const prompts = await prisma.prompts.findMany({
      where: {
        category_id: { not: null },
        deleted_at: null
      },
      select: { id: true, title: true, category_id: true }
    });

    const mappedCategories = categories.map(cat => {
      const catPrompts = prompts.filter(p => p.category_id !== null && p.category_id === cat.id);
      return {
        ...cat,
        prompts: catPrompts.map(p => ({ id: p.id, title: p.title })),
        array_count: catPrompts.length
      };
    });

    return NextResponse.json(mappedCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/categories
 * Create a new category (ADMIN or EDITOR only).
 */
export async function POST(request: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role;
    if (userRole !== "ADMIN" && userRole !== "EDITOR") {
      return NextResponse.json(
        { error: "Only ADMIN and EDITOR can create categories" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const data = CreateCategorySchema.parse(body);

    // Check for duplicate name
    const existing = await prisma.categories.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 409 }
      );
    }

    const newCategory = await prisma.$transaction(async (tx) => {

      const category = await tx.categories.create({
        data: {
          name: data.name,
          color: data.color ?? null,
        },
      });

      await tx.activity_log.create({
        data: {
          user_id: Number(session.user.id),
          action: "CREATE_CATEGORY",
          details: { categoryId: category.id,
                      name: category.name },
        },
      });
      return category;
    });

   return NextResponse.json({ message: "Category created", category: newCategory }, { status: 201 });
   
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
