import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // สร้างชื่อไฟล์ใหม่เพื่อกันชื่อซ้ำ
    const fileExtension = file.name.split(".").pop();
    const fileName = `${randomUUID()}.${fileExtension}`;
    
    // กำหนด Path ที่จะเก็บไฟล์
    const uploadDir = join(process.cwd(), "public", "uploads");
    
    // ตรวจสอบและสร้างโฟลเดอร์ถ้ายังไม่มี
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // Folder might already exist
    }

    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // ส่ง URL ของไฟล์กลับไป
    const fileUrl = `/uploads/${fileName}`;

    return NextResponse.json({ url: fileUrl, originalName: file.name });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
