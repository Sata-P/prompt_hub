import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import {
  chatCompletionStream,
  formatLLMError,
  isValidProvider,
  LLMMessage,
  LLMProvider,
} from "@/lib/llm";
import { prisma } from "@/lib/prisma";

// Safety limits
const MAX_RENDERED_PROMPT_LEN = 32_000;
const MAX_SYSTEM_PROMPT_LEN = 8_000;

/**
 * POST /api/playground/run
 *
 * BYOK — user must provide their own API key per request. Server NEVER stores
 * or logs the apiKey.
 *
 * Body:
 *   - provider: "openai" | "gemini"        (required)
 *   - apiKey:   string                      (required, never persisted)
 *   - model:    string                      (required)
 *   - rendered_prompt: string               (required)
 *   - system_prompt?: string
 *   - variables_input?: Record<string, string>
 *   - temperature?: number
 *   - maxTokens?: number
 *   - promptId?: number
 *   - versionId?: number
 */
export async function POST(request: Request) {
  // ปิด log ทุกประเภทของ body ที่อาจมี apiKey — เฉพาะ field ที่ปลอดภัยเท่านั้น
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      provider,
      apiKey,
      model,
      promptId,
      versionId,
      rendered_prompt,
      system_prompt,
      variables_input,
      temperature,
      maxTokens,
    } = body as {
      provider?: string;
      apiKey?: string;
      model?: string;
      promptId?: number | null;
      versionId?: number | null;
      rendered_prompt?: string;
      system_prompt?: string;
      variables_input?: Record<string, string>;
      temperature?: number;
      maxTokens?: number;
    };

    if (!isValidProvider(provider)) {
      return NextResponse.json(
        { error: "Invalid provider. Must be 'openai' or 'gemini'." },
        { status: 400 }
      );
    }
    if (!apiKey || typeof apiKey !== "string" || apiKey.length < 8) {
      return NextResponse.json(
        { error: "API key is required." },
        { status: 400 }
      );
    }
    // API keys must be pure ASCII because they are sent in the HTTP
    // Authorization header (a ByteString, Latin-1). Smart paste from
    // word processors can replace '-' with em dash (U+2014) and break
    // the request with a cryptic "ByteString" error from fetch.
    // Catch this here and return a friendly message instead.
    if (/[^\x20-\x7E]/.test(apiKey)) {
      return NextResponse.json(
        {
          error:
            "Your API key contains invalid characters (e.g. smart-quotes or em dashes). Please re-copy the key directly from the provider's dashboard and paste it again.",
        },
        { status: 400 }
      );
    }
    if (!model || typeof model !== "string") {
      return NextResponse.json(
        { error: "Model is required." },
        { status: 400 }
      );
    }
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
    if (
      typeof system_prompt === "string" &&
      system_prompt.length > MAX_SYSTEM_PROMPT_LEN
    ) {
      return NextResponse.json(
        { error: `System prompt too long (max ${MAX_SYSTEM_PROMPT_LEN} chars).` },
        { status: 413 }
      );
    }

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

    const messages: LLMMessage[] = [];
    if (system_prompt?.trim()) {
      messages.push({ role: "system", content: system_prompt.trim() });
    }
    messages.push({ role: "user", content: rendered_prompt });

    const startTime = Date.now();

    const stream = await chatCompletionStream({
      provider: provider as LLMProvider,
      apiKey,
      model,
      messages,
      temperature,
      maxTokens,
      signal: request.signal,
    });

    // Inspect chunks for DB log (no apiKey is captured here)
    let fullContent = "";
    let usageData: { totalTokens?: number } | null = null;
    let usedModel = model;
    let sawError: string | null = null;

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk);
        const lines = text
          .split("\n")
          .filter((line) => line.startsWith("data: "));

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
            /* ignore */
          }
        }
        controller.enqueue(chunk);
      },

      async flush() {
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

    const responseStream = stream.pipeThrough(transformStream);

    return new Response(responseStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    // ห้าม log error.message ตรง ๆ เพราะ provider บางเจ้าใส่ apiKey กลับมาใน url
    const friendly = formatLLMError(error);
    // Propagate upstream HTTP status so the client can distinguish
    // user-side issues (4xx) from server-side issues (5xx).
    const upstreamStatus = (error as { status?: number })?.status;
    const status =
      typeof upstreamStatus === "number" &&
      upstreamStatus >= 400 &&
      upstreamStatus < 600
        ? upstreamStatus
        : 502; // bad gateway by default
    // Log expected user-fixable errors (4xx) at warn level so they don't
    // pollute server logs as if they were bugs.
    if (status >= 500) {
      console.error("Playground run error:", friendly);
    } else {
      console.warn("Playground run rejected:", status, friendly);
    }
    return NextResponse.json({ error: friendly }, { status });
  }
}
