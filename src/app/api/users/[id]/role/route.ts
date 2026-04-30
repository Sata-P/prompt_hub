import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // //Role Guard: Can restrict this only to ADMIN in a real application
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const { id } = await params;
    const userId = Number(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const body = await request.json();
    const newRole = body.role;

    if (!newRole || !["VIEWER", "EDITOR", "ADMIN"].includes(newRole)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Fetch current role for logging
    const currentUser = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const updated = await tx.users.update({
        where: { id: userId },
        data: { role: newRole },
        select: { id: true, name: true, email: true, role: true },
      });

      await tx.activity_log.create({
        data: {
          user_id: Number(session.user.id),
          action: "UPDATE_USER_ROLE",
          details: {
            targetUserId: currentUser.id,
            targetUserName: currentUser.name,
            targetUserEmail: currentUser.email,
            oldRole: currentUser.role,
            newRole: updated.role,
          },
        },
      });

      return updated;
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 }
    );
  }
}
