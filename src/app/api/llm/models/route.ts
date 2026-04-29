import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { listModels, getDefaultModel } from "@/lib/llm";

/**
 * GET /api/llm/models
 *
 * ดึงรายชื่อ LLM models ที่ใช้ได้
 * Response:
 *   - models: Array<{ id, name, owned_by }>
 *   - defaultModel: string
 */
export async function GET() {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const models = await listModels();
    const defaultModel = getDefaultModel();

    return NextResponse.json({
      models,
      defaultModel,
    });
  } catch (error: any) {
    console.error("Failed to fetch models:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch models" },
      { status: 500 }
    );
  }
}
