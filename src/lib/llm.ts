import OpenAI from "openai";

// -------------------------------------------------------
// LLM Service — Abstraction layer สำหรับเชื่อมต่อ LLM API
// รองรับ OpenAI-compatible providers ทุกตัว
// (OpenAI, Azure, Ollama, LiteLLM Proxy, OpenRouter, Groq, etc.)
// -------------------------------------------------------

/**
 * Environment variables ที่ใช้:
 *   - LLM_API_KEY          : API key (required)
 *   - LLM_BASE_URL         : Base URL (default: https://api.openai.com/v1)
 *   - LLM_DEFAULT_MODEL    : Model หลักที่จะใช้ (required ถ้า caller ไม่ส่งมา)
 *   - LLM_FALLBACK_MODELS  : list คั่นด้วย comma สำหรับ auto-retry ถ้า model หลักล้ม
 *   - LLM_AVAILABLE_MODELS : list สำหรับ UI/model picker (fallback เมื่อ list API ล่ม)
 *   - LLM_REQUEST_TIMEOUT_MS : timeout ต่อการเรียก 1 ครั้ง (default 60000)
 */
function createLLMClient(): OpenAI {
  const apiKey = process.env.LLM_API_KEY;
  const baseURL = process.env.LLM_BASE_URL || "https://api.openai.com/v1";

  if (!apiKey) {
    throw new Error(
      "LLM_API_KEY is not configured. Please set it in your .env file."
    );
  }

  return new OpenAI({
    apiKey,
    baseURL,
    // ปิด SDK retry เพราะเราจัดการ fallback chain เอง
    // (default = 2 → ทำให้ timeout ถูกคูณ 3 เท่า)
    maxRetries: 0,
  });
}

// Singleton client instance
let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    _client = createLLMClient();
  }
  return _client;
}

/** รีเซ็ต singleton — ใช้ใน test หรือเวลา env เปลี่ยน */
export function resetLLMClient(): void {
  _client = null;
}

function getRequestTimeoutMs(): number {
  const v = Number(process.env.LLM_REQUEST_TIMEOUT_MS);
  return Number.isFinite(v) && v > 0 ? v : 30000; // 30s default — fail fast
}

function resolveModelChain(requested?: string): string[] {
  const primary = requested || process.env.LLM_DEFAULT_MODEL;
  const fallbacks = (process.env.LLM_FALLBACK_MODELS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const chain: string[] = [];
  if (primary) chain.push(primary);
  for (const m of fallbacks) {
    if (!chain.includes(m)) chain.push(m);
  }
  if (chain.length === 0) {
    throw new Error(
      "No LLM model configured. Set LLM_DEFAULT_MODEL in .env or pass `model` explicitly."
    );
  }
  return chain;
}

/**
 * แปลง error ดิบจาก provider ให้อ่านเข้าใจง่าย
 * จับ pattern ที่เจอบ่อย เช่น litellm connection error / 401 / 404 / timeout
 */
export function formatLLMError(error: unknown): string {
  if (!error) return "Unknown LLM error";
  const err = error as Record<string, unknown> & { message?: string; status?: number; code?: string | number };
  const msg = (err.message || String(error)).toString();
  const status = err.status;

  if (/abort/i.test(msg)) return "Request was cancelled.";
  if (/timed? ?out|ETIMEDOUT/i.test(msg)) {
    return "LLM provider took too long to respond (timeout). Try a smaller prompt or a different model.";
  }
  if (status === 401 || /unauthor/i.test(msg)) {
    // แยก 2 เคส:
    //  - LiteLLM ตอบ 401 จาก upstream (key ของเราถูก แต่ proxy config ไม่มี upstream key)
    //  - 401 จริง (key ของเราผิด)
    if (/didn'?t provide an API key|bearer|authorization header/i.test(msg)) {
      return "Upstream provider rejected the request (missing API key on LLM proxy). Contact the LLM admin to configure credentials for this model.";
    }
    return "LLM authentication failed — check LLM_API_KEY.";
  }
  if (status === 404 || /not ?found|model.+not.+exist/i.test(msg)) {
    return "Model not found on provider — check LLM_DEFAULT_MODEL / LLM_FALLBACK_MODELS.";
  }
  if (status === 429 || /rate.?limit/i.test(msg)) {
    return "Rate limit reached on LLM provider. Please retry in a moment.";
  }
  if (/connection error|ECONNREFUSED|ENOTFOUND|fetch failed/i.test(msg)) {
    return "Cannot reach LLM provider — network or upstream server is down.";
  }
  // litellm wraps upstream messages; strip the noisy prefix
  const cleaned = msg
    .replace(/^.*InternalServerError: ?/i, "")
    .replace(/Available Model Group Fallbacks=None/gi, "")
    .trim();
  return cleaned || "LLM request failed.";
}

// -------------------------------------------------------
// Types
// -------------------------------------------------------

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMChatOptions {
  model?: string;
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  /** AbortSignal จาก caller (route / client) สำหรับยกเลิกคำขอกลางคัน */
  signal?: AbortSignal;
}

export interface LLMChatResult {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: string | null;
}

export interface LLMModelInfo {
  id: string;
  name: string;
  owned_by?: string;
}

// -------------------------------------------------------
// Functions
// -------------------------------------------------------

/**
 * ดึงรายชื่อ models จาก LLM provider
 */
export async function listModels(): Promise<LLMModelInfo[]> {
  const client = getClient();

  try {
    const response = await client.models.list();
    const models: LLMModelInfo[] = [];

    for await (const model of response) {
      models.push({
        id: model.id,
        name: model.id,
        owned_by: model.owned_by,
      });
    }

    // Sort alphabetically; preferred model (LLM_DEFAULT_MODEL) goes first
    const preferred = (process.env.LLM_DEFAULT_MODEL || "").toLowerCase();
    models.sort((a, b) => {
      const ap = a.id.toLowerCase() === preferred;
      const bp = b.id.toLowerCase() === preferred;
      if (ap && !bp) return -1;
      if (!ap && bp) return 1;
      return a.id.localeCompare(b.id);
    });

    return models;
  } catch (error) {
    console.error("Failed to list models:", error);
    // ถ้า list ไม่ได้ ใช้ default models จาก env
    return getDefaultModels();
  }
}

/**
 * Model list จาก environment variable (fallback เมื่อ provider list ล่ม)
 */
function getDefaultModels(): LLMModelInfo[] {
  const defaultModel = process.env.LLM_DEFAULT_MODEL;
  const availableModels = process.env.LLM_AVAILABLE_MODELS || defaultModel || "";

  return availableModels
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean)
    .map((m) => ({ id: m, name: m }));
}

/**
 * Chat Completion — non-streaming พร้อม auto-fallback models + AbortSignal
 */
export async function chatCompletion(
  options: LLMChatOptions
): Promise<LLMChatResult> {
  const client = getClient();
  const chain = resolveModelChain(options.model);
  const timeout = getRequestTimeoutMs();

  let lastError: unknown;
  for (const model of chain) {
    try {
      const response = await client.chat.completions.create(
        {
          model,
          messages: options.messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 4096,
          stream: false,
        },
        { timeout, signal: options.signal }
      );

      const choice = response.choices[0];
      return {
        content: choice?.message?.content || "",
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
          totalTokens: response.usage?.total_tokens ?? 0,
        },
        finishReason: choice?.finish_reason ?? null,
      };
    } catch (err) {
      lastError = err;
      // ถ้าเป็นการ abort ไม่ต้อง retry
      if (options.signal?.aborted) throw err;
      console.warn(`[llm] model "${model}" failed, trying next fallback…`, formatLLMError(err));
    }
  }
  throw lastError ?? new Error("LLM request failed on all configured models.");
}

/**
 * Chat Completion Streaming — ส่ง prompt ไปยัง LLM และ stream ผลลัพธ์กลับ
 * คืน ReadableStream สำหรับส่ง SSE กลับ client
 */
export async function chatCompletionStream(
  options: LLMChatOptions
): Promise<ReadableStream<Uint8Array>> {
  const client = getClient();
  const chain = resolveModelChain(options.model);
  const timeout = getRequestTimeoutMs();

  // พยายามเปิด stream ด้วย model แรกที่สำเร็จ (fallback ระหว่างรอ first chunk)
  let stream: Awaited<ReturnType<typeof client.chat.completions.create>> | null = null;
  let usedModel = chain[0];
  let lastError: unknown;

  for (const model of chain) {
    try {
      console.log(`[llm] request model=${model} messages=${options.messages.length}`);
      stream = await client.chat.completions.create(
        {
          model,
          messages: options.messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 1024,
          stream: true,
          stream_options: { include_usage: true },
        },
        { timeout, signal: options.signal }
      );
      usedModel = model;
      break;
    } catch (err) {
      lastError = err;
      if (options.signal?.aborted) throw err;
      console.warn(`[llm] stream open failed for "${model}" — ${formatLLMError(err)}`);
    }
  }
  if (!stream) throw lastError ?? new Error("LLM stream could not be opened.");

  const encoder = new TextEncoder();
  const upstream = stream as AsyncIterable<import("openai/resources/chat").ChatCompletionChunk>;

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      // ส่ง meta event แจ้ง client ว่าใช้ model อะไรจริง
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "meta", model: usedModel })}\n\n`)
      );
      try {
        for await (const chunk of upstream) {
          const delta = chunk.choices[0]?.delta;

          if (delta?.content) {
            // ส่ง content chunk
            const data = JSON.stringify({
              type: "content",
              content: delta.content,
            });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }

          // Check for finish
          if (chunk.choices[0]?.finish_reason) {
            const finishData = JSON.stringify({
              type: "finish",
              finish_reason: chunk.choices[0].finish_reason,
            });
            controller.enqueue(encoder.encode(`data: ${finishData}\n\n`));
          }

          // ส่ง usage info (มาใน chunk สุดท้าย)
          if (chunk.usage) {
            const usageData = JSON.stringify({
              type: "usage",
              usage: {
                promptTokens: chunk.usage.prompt_tokens ?? 0,
                completionTokens: chunk.usage.completion_tokens ?? 0,
                totalTokens: chunk.usage.total_tokens ?? 0,
              },
              model: chunk.model,
            });
            controller.enqueue(encoder.encode(`data: ${usageData}\n\n`));
          }
        }

        // ส่ง [DONE] signal
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      } catch (error) {
        const errData = JSON.stringify({
          type: "error",
          error: formatLLMError(error),
        });
        controller.enqueue(encoder.encode(`data: ${errData}\n\n`));
        controller.close();
      }
    },
    cancel() {
      // client ยกเลิก → พยายามยกเลิก upstream
      try {
        (upstream as unknown as { controller?: { abort: () => void } })?.controller?.abort?.();
      } catch {
        /* noop */
      }
    },
  });
}

/**
 * ดึง default model name (อาจเป็น empty string ถ้าไม่ตั้งค่า)
 */
export function getDefaultModel(): string {
  return process.env.LLM_DEFAULT_MODEL || "";
}
