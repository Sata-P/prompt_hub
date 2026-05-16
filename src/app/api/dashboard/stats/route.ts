import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";

/**
 * GET /api/dashboard/stats
 * 
 * ดึงสถิติภาพรวมของ dashboard สำหรับผู้ใช้ที่ login อยู่
 *
 * ต้องการ Authentication — ถ้าไม่มี session จะคืน 401
 *
 * Response JSON:
 *   totalPrompts       - จำนวน prompt ทั้งหมดของ user (ไม่รวม deleted)
 *   byStatus           - จำนวน prompt แยกตามสถานะ { DRAFT, REVIEW, PUBLISHED, REJECTED, ARCHIVED }
 *   recentPrompts      - 5 prompt ที่อัปเดตล่าสุด (พร้อม category)
 *   totalCategories    - จำนวนหมวดหมู่ทั้งหมดในระบบ
 *   totalTags          - จำนวน tag ทั้งหมดในระบบ
 */
export async function GET() {
  try {
    // ตรวจสอบ session — ถ้าไม่ได้ login ให้ return 401
    const session = await getServerAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);

    // เงื่อนไขพื้นฐานที่ใช้ซ้ำ: เป็น prompt ของ user นี้ และยังไม่ถูกลบ
    const baseWhere = { owner_id: userId, deleted_at: null };

    // ยิง query ทั้งหมดพร้อมกันด้วย Promise.all เพื่อประหยัดเวลา
    const [
      totalPrompts,
      draftCount,
      reviewCount,
      publishedCount,
      rejectedCount,
      archivedCount,
      recentPrompts,
      totalCategories,
      totalTags,
      totalFavorites,
      systemTotalPrompts,
      popularCategories,
      popularTags,
    ] = await Promise.all([
      // นับ prompt ทั้งหมด (ทุกสถานะ)
      prisma.prompts.count({ where: baseWhere }),
      // นับ prompt แยกตามสถานะ
      prisma.prompts.count({ where: { ...baseWhere, status: "DRAFT" } }),
      prisma.prompts.count({ where: { ...baseWhere, status: "REVIEW" } }),
      prisma.prompts.count({ where: { ...baseWhere, status: "PUBLISHED" } }),
      prisma.prompts.count({ where: { ...baseWhere, status: "REJECTED" } }),
      prisma.prompts.count({ where: { ...baseWhere, status: "ARCHIVED" } }),
      // ดึง 4 prompt ล่าสุดพร้อมข้อมูล category
      prisma.prompts.findMany({
        where: baseWhere,
        orderBy: { updated_at: "desc" },
        take: 4,
        select: {
          id: true,
          title: true,
          status: true,
          latest_version_no: true,
          updated_at: true,
          category: { select: { id: true, name: true, color: true } },
        },
      }),
      // นับ categories และ tags ทั้งหมดในระบบ (ไม่กรอง user)
      prisma.categories.count(),
      prisma.tags.count(),
      // นับ favorite ของ user นี้
      prisma.favorites.count({ where: { user_id: userId } }),
      // นับ prompt ทั้งหมดในระบบ (ไม่รวม deleted)
      prisma.prompts.count({ where: { deleted_at: null } }),
      // ดึง categories ยอดฮิต 5 อันดับแรกพร้อมจำนวน prompt
      prisma.categories.findMany({
        take: 3,
        include: { 
          _count: { select: { prompts: true } },
          prompts: {
            where: { deleted_at: null },
            select: { id: true, title: true, status: true },
            orderBy: { updated_at: 'desc' }
          }
        },
        orderBy: { prompts: { _count: 'desc' } }
      }),
      // ดึง tags ยอดฮิต 5 อันดับแรกพร้อมจำนวน prompt
      prisma.tags.findMany({
        take: 5,
        include: { 
          _count: { select: { prompts: true } },
          prompts: {
            take: 5,
            include: {
              prompt: {
                select: { id: true, title: true, status: true }
              }
            }
          }
        },
        orderBy: { prompts: { _count: 'desc' } }
      }),
    ]);

    // รวมผลลัพธ์และส่งกลับ
    return NextResponse.json({
      totalPrompts,
      byStatus: {
        DRAFT: draftCount,
        REVIEW: reviewCount,
        PUBLISHED: publishedCount,
        REJECTED: rejectedCount,
        ARCHIVED: archivedCount,
      },
      recentPrompts,
      totalCategories,
      totalTags,
      totalFavorites,
      systemTotalPrompts,
      popularCategories,
      popularTags,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
