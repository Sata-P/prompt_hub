import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { CreateTagSchema } from "@/lib/validations/tag";
import { z } from "zod";

/**
 * GET /api/tags
 * List all tags, optionally filtered by name search.
 *
 * Query params:
 *   q - search by tag name (partial match)
 */
export async function GET(request: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";

    const where: Record<string, unknown> = {};
    if (q) {
      where.name = { contains: q, mode: "insensitive" };
    }

    const tags = await prisma.tags.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { prompts: true },
        },
      },
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tags
 * Create a new tag (or return existing one if duplicate).
 */
export async function POST(request: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = CreateTagSchema.parse(body);

    const tag = await prisma.tags.upsert({
      where: { name: data.name },
      create: { name: data.name },
      update: {},
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating tag:", error);
    return NextResponse.json(
      { error: "Failed to create tag" },
      { status: 500 }
    );
  }
}
