import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { chatCompletionStream, formatLLMError, LLMMessage } from "@/lib/llm";
import { prisma } from "@/lib/prisma";

// Safety limit กัน payload ใหญ่เกิน (ป้องกัน token blow-up)
const MAX_RENDERED_PROMPT_LEN = 32_000;
const MAX_SYSTEM_PROMPT_LEN = 8_000;

/**
 * POST /api/playground/run
 *
 * รัน Prompt ผ่าน LLM API พร้อม Streaming response
 *
 * Body:
 *   - promptId: number
 *   - versionId: number
 *   - rendered_prompt: string (prompt ที่ render แล้ว)
 *   - system_prompt?: string
 *   - variables_input?: Record<string, string>
 *   - model?: string
 *   - temperature?: number
 *   - maxTokens?: number
 */
export async function POST(request: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      promptId,
      versionId,
      rendered_prompt,
      system_prompt,
      variables_input,
      model,
      temperature,
      maxTokens,
    } = body;

    if (!rendered_prompt || typeof rendered_prompt !== "string") {
      return NextResponse.json(
        { error: "rendered_prompt is required" },
        { status: 400 }
      );
    }
    if (rendered_prompt.length > MAX_RENDERED_PROMPT_LEN) {
      return NextResponse.json(
        { error: `Prompt too long (max ${MAX_RENDERED_PROMPT_LEN} chars).` },
        { status: 413 }
      );
    }
    if (typeof system_prompt === "string" && system_prompt.length > MAX_SYSTEM_PROMPT_LEN) {
      return NextResponse.json(
        { error: `System prompt too long (max ${MAX_SYSTEM_PROMPT_LEN} chars).` },
        { status: 413 }
      );
    }

    // เช็คสิทธิ์การเข้าถึง prompt (ถ้าส่ง promptId/versionId มา)
    const userId = Number(session.user.id);
    const userRole = session.user.role;
    if (promptId) {
      const prompt = await prisma.prompts.findUnique({
        where: { id: Number(promptId) },
        select: { id: true, owner_id: true, visibility: true, deleted_at: true },
      });
      if (!prompt || prompt.deleted_at) {
        return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
      }
      const isOwner = prompt.owner_id === userId;
      const isPublic = prompt.visibility === "PUBLIC";
      const isPrivileged = userRole === "ADMIN" || userRole === "EDITOR";
      if (!isOwner && !isPublic && !isPrivileged) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // สร้าง messages array
    const messages: LLMMessage[] = [];

    // เพิ่ม system prompt ถ้ามี
    if (system_prompt?.trim()) {
      messages.push({
        role: "system",
        content: system_prompt.trim(),
      });
    }

    // เพิ่ม user prompt
    messages.push({
      role: "user",
      content: rendered_prompt,
    });

    const startTime = Date.now();

    // เรียก LLM แบบ streaming — forward AbortSignal ไปด้วย
    // เมื่อ client ปิด connection, Next.js จะ abort request.signal → หยุด upstream ด้วย
    const stream = await chatCompletionStream({
      model,
      messages,
      temperature,
      maxTokens,
      signal: request.signal,
    });

    // ใช้ TransformStream เพื่อดักจับ content สำหรับบันทึก DB
    let fullContent = "";
    let usageData: { totalTokens?: number } | null = null;
    let usedModel = model || "";
    let sawError: string | null = null;

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        // Parse chunk เพื่อเก็บข้อมูล
        const text = new TextDecoder().decode(chunk);
        const lines = text.split("\n").filter((line) => line.startsWith("data: "));

        for (const line of lines) {
          const jsonStr = line.replace("data: ", "");
          if (jsonStr === "[DONE]") continue;

          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.type === "meta" && parsed.model) {
              usedModel = parsed.model;
            }
            if (parsed.type === "content") {
              fullContent += parsed.content;
            }
            if (parsed.type === "usage") {
              usageData = parsed.usage;
              usedModel = parsed.model || usedModel;
            }
            if (parsed.type === "error") {
              sawError = String(parsed.error || "LLM error");
            }
          } catch {
            // ignore parse errors
          }
        }

        // ส่ง chunk ต่อไปยัง client
        controller.enqueue(chunk);
      },

      async flush() {
        // บันทึกผลลัพธ์ลง DB หลัง stream เสร็จ (ทั้ง SUCCESS และ ERROR)
        if (promptId && versionId) {
          const executionTime = Date.now() - startTime;
          try {
            await prisma.prompt_run.create({
              data: {
                prompt_id: Number(promptId),
                prompt_version_id: Number(versionId),
                user_id: userId,
                rendered_prompt,
                variables_input: variables_input || {},
                output_response: fullContent || null,
                execution_time_ms: executionTime,
                token_used: usageData?.totalTokens ?? 0,
                model: usedModel || null,
                status: sawError ? "ERROR" : "SUCCESS",
                error_message: sawError,
              },
            });
          } catch (dbError) {
            console.error("Failed to save prompt run:", dbError);
          }
        }
      },
    });

    // Pipe stream ผ่าน transform
    const responseStream = stream.pipeThrough(transformStream);

    return new Response(responseStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Playground run error:", error);
    return NextResponse.json(
      { error: formatLLMError(error) },
      { status: 500 }
    );
  }
}
