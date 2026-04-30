import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";

// Type สำหรับ dynamic route params: /api/tags/[id]
type RouteContext = { params: Promise<{ id: string }> };

/**
 * DELETE /api/tags/[id]
 * ลบ tag ตาม id ที่ระบุ — เฉพาะ ADMIN เท่านั้น
 *
 * ขั้นตอน:
 *  1. ตรวจสอบ session (401 ถ้าไม่ได้ login)
 *  2. ตรวจสอบ role ว่าเป็น ADMIN (403 ถ้าไม่ใช่)
 *  3. validate tagId (400 ถ้าไม่ใช่ตัวเลข)
 *  4. ลบ prompt_tags ที่เชื่อมอยู่ก่อน แล้วค่อยลบ tag (ใน transaction)
 */
export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    // ตรวจสอบ session
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // เฉพาะ ADMIN เท่านั้นที่ลบ tag ได้
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only ADMIN can delete tags" }, { status: 403 });
    }

    // รับ id จาก dynamic segment และแปลงเป็นตัวเลข
    const { id } = await params;
    const tagId = Number(id);

    // ตรวจสอบว่า id ที่รับมาเป็นตัวเลขที่ถูกต้อง
    if (isNaN(tagId)) {
      return NextResponse.json({ error: "Invalid tag ID" }, { status: 400 });
    }

    // ใช้ transaction เพื่อให้การลบเป็น atomic:
    // ต้องลบ prompt_tags (ตารางกลาง) ก่อน แล้วค่อยลบ tag
    // เพื่อไม่ให้เกิด foreign key constraint error
    await prisma.$transaction(async (tx) => {
      // 1. ลบ record ใน prompt_tags ที่อ้างถึง tag นี้ทั้งหมด
      await tx.prompt_tags.deleteMany({
        where: { tag_id: tagId },
      });

      // 2. ลบ tag หลัก
      await tx.tags.delete({
        where: { id: tagId },
      });
    });

    return NextResponse.json({ message: "Tag deleted successfully" });
  } catch (error) {
    console.error("Error deleting tag:", error);
    return NextResponse.json(
      { error: "Failed to delete tag" },
      { status: 500 }
    );
  }
}
