import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only ADMIN can delete users" }, { status: 403 });
    }

    const { id } = await params;
    const userId = Number(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // You cannot delete yourself
    if (userId === Number(session.user.id)) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    // Fetch user info before deletion for logging purposes
    const targetUser = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Since we cascade on relations like Prompts/Favorites/Versions, deleting a user will delete their data
    await prisma.$transaction(async (tx) => {
      await tx.users.delete({
        where: { id: userId },
      });

      await tx.activity_log.create({
        data: {
          user_id: Number(session.user.id),
          action: "DELETE_USER",
          details: {
            deletedUserId: targetUser.id,
            deletedUserName: targetUser.name,
            deletedUserEmail: targetUser.email,
            deletedUserRole: targetUser.role,
          },
        },
      });
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
