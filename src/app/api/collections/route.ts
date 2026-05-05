import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { CreateCollectionSchema, UpdateCollectionSchema } from "@/lib/validations/collection";
import { z } from "zod";



export async function GET() {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = session.user.role === "ADMIN";

    const categories = await prisma.collections.findMany({
      where: isAdmin ? undefined : { visibility: "PUBLIC" },
      orderBy: { id: "asc" },
      include: {
        _count: {
          select: { prompts: true },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}



export async function POST(request: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role;
    if (userRole !== "ADMIN" && userRole !== "EDITOR") {
      return NextResponse.json({ error: "You don't have permission to create a collection, only ADMIN and EDITOR can create a collection" }, { status: 403 });
    }

    const body = await request.json();
    const data = UpdateCollectionSchema.parse(body);

    const conflict = await prisma.collections.findFirst({
      where: { name: data.name },
    });
    if (conflict) {
      return NextResponse.json(
        { error: "Collection with this name already exists" },
        { status: 409 }
      );
    }

    const collection = await prisma.$transaction(async (tx) => {
      const newCollection = await tx.collections.create({
        data: {
          name: String(data.name),
          description: String(data.description),
        },
      });

      await tx.activity_log.create({
        data: {
          user_id: Number(session.user.id),
          action: "CREATE_COLLECTION",
          details: { collectionId: newCollection.id, name: newCollection.name },
        },
      });

      return newCollection;
    });

    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating collection:", error);
    return NextResponse.json(
      { error: "Failed to create collection" },
      { status: 500 }
    );
  }
}


