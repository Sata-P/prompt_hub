import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { UpdateCollectionSchema } from "@/lib/validations/collection";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

// export async function PUT(request: Request, { params }: RouteContext) {
//     try {
//         const session = await getServerAuthSession();
//         if (!session?.user) {
//             return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//         }

//         const { id } = await params;
//         const collectionId = Number(id);

//         if (isNaN(collectionId)) {
//             return NextResponse.json({ error: "Invalid collection ID" }, { status: 400 });
//         }

//         const body = await request.json();
//         const validated = UpdateCollectionSchema.safeParse(body);

//         if (!validated.success) {
//             return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
//         }

//         const { name, description, visibility } = validated.data;

//         const updatedCollection = await prisma.collections.update({
//             where: { id: collectionId },
//             data: {
//                 name,
//                 description,
//                 visibility,
//             },
//         });

//         return NextResponse.json(updatedCollection);
//     } catch (error) {
//         console.error("Error updating collection:", error);
//         return NextResponse.json(
//             { error: "Failed to update collection" },
//             { status: 500 }
//         );
//     }
// }

export async function DELETE(request: Request, { params }: RouteContext) {
    try {
        const session = await getServerAuthSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRole = session.user.role;
        if (userRole !== "ADMIN" && userRole !== "EDITOR") {
            return NextResponse.json({ error: "You don't have permission to delete a collection, only ADMIN and EDITOR can delete a collection" }, { status: 403 });
        }

        const { id } = await params;
        const collectionId = Number(id);

        if (isNaN(collectionId)) {
            return NextResponse.json({ error: "Invalid collection ID" }, { status: 400 });
        }

        // Fetch info before deletion for logging
        const targetCollection = await prisma.collections.findUnique({
            where: { id: collectionId },
            select: { id: true, name: true },
        });

        if (!targetCollection) {
            return NextResponse.json({ error: "Collection not found" }, { status: 404 });
        }

        await prisma.$transaction(async (tx) => {
            await tx.collections.delete({
                where: { id: collectionId },
            });

            await tx.activity_log.create({
                data: {
                    user_id: Number(session.user.id),
                    action: "DELETE_COLLECTION",
                    details: { collectionId: targetCollection.id, name: targetCollection.name },
                },
            });
        });

        return NextResponse.json({ message: "Collection deleted successfully" });
    } catch (error) {
        console.error("Error deleting collection:", error);
        return NextResponse.json(
            { error: "Failed to delete collection" },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request, { params }: RouteContext) {
    try {
        const session = await getServerAuthSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRole = session.user.role;
        if (userRole !== "ADMIN" && userRole !== "EDITOR") {
            return NextResponse.json({ error: "You don't have permission to update a collection, only ADMIN and EDITOR can update a collection" }, { status: 403 });
        }

        const { id } = await params;
        const collectionId = Number(id);

        if (isNaN(collectionId)) {
            return NextResponse.json({ error: "Invalid collection ID" }, { status: 400 });
        }

        const body = await request.json();
        const validated = UpdateCollectionSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
        }

        const { name, description, visibility } = validated.data;

        const updatedCollection = await prisma.$transaction(async (tx) => {
            const updated = await tx.collections.update({
                where: { id: collectionId },
                data: {
                    name,
                    description,
                    visibility,
                },
            });

            await tx.activity_log.create({
                data: {
                    user_id: Number(session.user.id),
                    action: "UPDATE_COLLECTION",
                    details: {
                        collectionId: updated.id,
                        name: updated.name,
                        visibility: updated.visibility,
                    },
                },
            });

            return updated;
        });

        return NextResponse.json(updatedCollection);
    } catch (error) {
        console.error("Error updating collection:", error);
        return NextResponse.json(
            { error: "Failed to update collection" },
            { status: 500 }
        );
    }
}

    export async function GET(request: Request, { params }: RouteContext) {
    try {
        const session = await getServerAuthSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const collectionId = Number(id);

        if (isNaN(collectionId)) {
            return NextResponse.json({ error: "Invalid collection ID" }, { status: 400 });
        }

        const isAdmin = session.user.role === "ADMIN";
        const userId = Number(session.user.id);

        const collection = await prisma.collections.findUnique({
            where: { id: collectionId },
            include: {
                prompts: {
                    where: isAdmin ? undefined : {
                        prompt: {
                            OR: [
                                { visibility: "PUBLIC" },
                                { owner_id: userId }
                            ]
                        }
                    },
                    include: {
                        prompt: {
                            include: {
                                category: true,
                            }
                        }
                    },
                    orderBy: {
                        sort_order: 'asc'
                    }
                }
            }
        });

        if (!collection) {
            return NextResponse.json({ error: "Collection not found" }, { status: 404 });
        }

        const isEditor = session.user.role === "EDITOR";
        if (!isAdmin && !isEditor && collection.visibility !== "PUBLIC") {
            return NextResponse.json({ error: "You do not have permission to view this collection" }, { status: 403 });
        }

        return NextResponse.json(collection);
    } catch (error) {
        console.error("Error fetching collection:", error);
        return NextResponse.json(
            { error: "Failed to fetch collection" },
            { status: 500 }
        );
    }
}

