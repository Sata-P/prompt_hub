import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";

/**
 * GET /api/activityLog
 * - ADMIN: ดู log ของทุกคน (พร้อมข้อมูล user)
 * - User ทั่วไป: ดู log ของตัวเองเท่านั้น
 * - รองรับ query params: page, limit
 */
export async function GET(request: Request) {
    try {
        const session = await getServerAuthSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = Math.max(1, Number(searchParams.get("page") ?? 1));
        const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 20)));
        const skip = (page - 1) * limit;

        const isAdmin = session.user.role === "ADMIN";

        // ADMIN เห็น log ทุกคน, user ทั่วไปเห็นแค่ของตัวเอง
        const where = isAdmin ? {} : { user_id: Number(session.user.id) };

        const [logs, total] = await Promise.all([
            prisma.activity_log.findMany({
                where,
                orderBy: { created_at: "desc" },
                skip,
                take: limit,
                // include user name เฉพาะ ADMIN เห็น
                ...(isAdmin && {
                    include: {
                        user: { select: { id: true, name: true, email: true } },
                    },
                }),
            }),
            prisma.activity_log.count({ where }),
        ]);

        return NextResponse.json({
            data: logs,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching activity log:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
