import OpenAI from "openai";

// -------------------------------------------------------
// LLM Service — BYOK (Bring Your Own Key)
// ผู้ใช้ส่ง provider + apiKey + model มาทุกคำขอ
// **ห้าม** เก็บ apiKey ลงไฟล์ / log / DB / cache ใด ๆ ทั้งสิ้น
// -------------------------------------------------------

export type LLMProvider = "openai" | "gemini";

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMChatOptions {
  provider: LLMProvider;
  apiKey: string;
  model: string;
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
}

export interface LLMModelInfo {
  id: string;
  name: string;
}

// -------------------------------------------------------
// Static model lists per provider (เพื่อให้ UI เลือกได้ทันทีโดยไม่ต้องใช้ key)
// -------------------------------------------------------
export const PROVIDER_MODELS: Record<LLMProvider, LLMModelInfo[]> = {
  openai: [
    { id: "gpt-4o", name: "GPT-4o" },
    { id: "gpt-4o-mini", name: "GPT-4o mini" },
    { id: "gpt-4.1", name: "GPT-4.1" },
    { id: "gpt-4.1-mini", name: "GPT-4.1 mini" },
    { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
  ],
  gemini: [
    { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro" },
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" },
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash" },
    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro" },
    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash" },
  ],
};

export const PROVIDERS: { id: LLMProvider; name: string; keyHint: string }[] = [
  { id: "openai", name: "OpenAI (GPT)", keyHint: "sk-..." },
  { id: "gemini", name: "Google Gemini", keyHint: "AIza..." },
];

const PROVIDER_BASE_URLS: Record<LLMProvider, string> = {
  openai: "https://api.openai.com/v1",
  gemini: "https://generativelanguage.googleapis.com/v1beta/openai/",
};

const REQUEST_TIMEOUT_MS = 60_000;

// -------------------------------------------------------
// Client factory — ห้าม cache (apiKey เป็นของ user)
// -------------------------------------------------------
function buildClient(provider: LLMProvider, apiKey: string): OpenAI {
  return new OpenAI({
    apiKey,
    baseURL: PROVIDER_BASE_URLS[provider],
    maxRetries: 0,
  });
}

export function isValidProvider(v: unknown): v is LLMProvider {
  return v === "openai" || v === "gemini";
}

// -------------------------------------------------------
// Error formatter — ตัด apiKey/Authorization จาก error message ก่อน return
// -------------------------------------------------------
const SECRET_PATTERN = /(sk-[A-Za-z0-9_-]+|AIza[A-Za-z0-9_-]+|Bearer\s+[A-Za-z0-9._-]+)/g;

/**
 * Force the resulting string to contain only safe ASCII characters
 * (0x20-0x7E plus tab/newline). This prevents downstream layers
 * (Next.js dev runtime, middleware, proxies) from crashing when the
 * message is propagated through HTTP headers, which only accept
 * ByteString (Latin-1) values.
 */
function toAsciiSafe(s: string): string {
  return s
    // Common typographic punctuation -> ASCII equivalents
    .replace(/[\u2012\u2013\u2014\u2015]/g, "-") // en/em dashes
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'") // curly single quotes
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"') // curly double quotes
    .replace(/[\u2026]/g, "...")                  // ellipsis
    .replace(/[\u00A0]/g, " ")                    // non-breaking space
    // Strip anything still outside printable ASCII range
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "");
}

export function formatLLMError(error: unknown): string {
  if (!error) return "Unknown LLM error";
  const err = error as {
    message?: string;
    status?: number;
    error?: { message?: string };
  };
  // OpenAI SDK errors keep the upstream's structured detail in `error.error.message`.
  // Prefer that over the generic top-level message because it explains what
  // the provider actually rejected (e.g. unsupported parameter, bad model name).
  const detail = err.error?.message;
  const raw = (detail || err.message || String(error)).toString();
  const msg = raw.replace(SECRET_PATTERN, "[REDACTED]");
  const status = err.status;

  let out: string;
  // 1. Abort always wins (user cancelled or component unmounted)
  if (/abort/i.test(msg)) out = "Request was cancelled.";
  // 2. ByteString = our own bug surface (corrupted apiKey chars)
  else if (/ByteString|character at index \d+ has a value/i.test(msg)) {
    out =
      "Your API key contains invalid characters (likely a smart-quote or em dash from copy-paste). Please re-copy the key directly from the provider's dashboard.";
  }
  // 3. Timeouts (network-level)
  else if (/timed? ?out|ETIMEDOUT/i.test(msg)) {
    out = "Provider took too long to respond (timeout). Try a smaller prompt or another model.";
  }
  // 4. HTTP status is the most authoritative signal - check it BEFORE regex.
  //    Otherwise a 429 message containing "invalid request" gets misclassified as 400.
  else if (status === 429) {
    out = "Rate limit / quota reached on your API key. Please retry later.";
  } else if (status === 401) {
    out = "Authentication failed - please check that your API key is correct and has access to this model.";
  } else if (status === 403) {
    out = "Your API key does not have permission for this model.";
  } else if (status === 404) {
    out = "Model not found - check that the selected model is available on your account.";
  } else if (status === 400) {
    const detailPart = detail ? ` Details: ${detail}` : "";
    out =
      "The provider rejected the request (400)." + detailPart +
      " Try another model (e.g. gemini-2.0-flash or gpt-4o-mini).";
  }
  // 5. No HTTP status - fall back to message-pattern detection
  else if (/rate.?limit|quota/i.test(msg)) {
    out = "Rate limit / quota reached on your API key. Please retry later.";
  } else if (/unauthor|invalid.*api.*key|api key not valid/i.test(msg)) {
    out = "Authentication failed - please check that your API key is correct and has access to this model.";
  } else if (/permission|forbidden/i.test(msg)) {
    out = "Your API key does not have permission for this model.";
  } else if (/not ?found|model.+not.+exist/i.test(msg)) {
    out = "Model not found - check that the selected model is available on your account.";
  } else if (/no body|bad request|invalid.*request/i.test(msg)) {
    const detailPart = detail ? ` Details: ${detail}` : "";
    out =
      "The provider rejected the request (400)." + detailPart +
      " Try another model (e.g. gemini-2.0-flash or gpt-4o-mini).";
  } else if (/connection error|ECONNREFUSED|ENOTFOUND|fetch failed/i.test(msg)) {
    out = "Cannot reach the provider - network issue.";
  } else {
    out = msg.slice(0, 500);
  }

  return toAsciiSafe(out);
}

// -------------------------------------------------------
// Streaming chat completion
// -------------------------------------------------------
export async function chatCompletionStream(
  options: LLMChatOptions
): Promise<ReadableStream<Uint8Array>> {
  const { provider, apiKey, model, messages, temperature, maxTokens, signal } = options;

  if (!isValidProvider(provider)) {
    throw new Error(`Invalid provider: ${provider}`);
  }
  if (!apiKey || typeof apiKey !== "string" || apiKey.length < 8) {
    throw new Error("API key is required.");
  }
  if (!model || typeof model !== "string") {
    throw new Error("Model is required.");
  }

  const client = buildClient(provider, apiKey);

  // Build request params. Gemini's OpenAI-compat endpoint is stricter than
  // OpenAI's about unknown/unused parameters in some model versions, so we
  // keep the payload minimal and let the provider apply its own defaults.
  const baseParams = {
    model,
    messages,
    temperature: temperature ?? 0.7,
    stream: true as const,
  };
  const params =
    provider === "openai"
      ? {
          ...baseParams,
          max_tokens: maxTokens ?? 4096,
          stream_options: { include_usage: true },
        }
      : baseParams;

  let stream;
  try {
    stream = await client.chat.completions.create(params, {
      timeout: REQUEST_TIMEOUT_MS,
      signal,
    });
  } catch (err) {
    // Log everything we can about the failure (apiKey redacted) so we can
    // debug provider-side rejections without leaking the user's key.
    // OpenAI SDK errors can carry detail in many places depending on the
    // upstream's response shape - dump them all.
    const e = err as {
      status?: number;
      code?: string;
      message?: string;
      error?: unknown;
      response?: { status?: number; statusText?: string };
      headers?: Record<string, string>;
    };
    const dump = {
      provider,
      model,
      status: e.status,
      code: e.code,
      message: (e.message || "").replace(SECRET_PATTERN, "[REDACTED]"),
      errorField: JSON.stringify(e.error || null).replace(
        SECRET_PATTERN,
        "[REDACTED]"
      ),
      responseStatus: e.response?.status,
    };
    console.warn(`[llm] ${provider}/${model} request failed:`, dump);
    throw err;
  }

  const encoder = new TextEncoder();
  const upstream = stream as AsyncIterable<
    import("openai/resources/chat").ChatCompletionChunk
  >;

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ type: "meta", model, provider })}\n\n`
        )
      );
      try {
        for await (const chunk of upstream) {
          const delta = chunk.choices[0]?.delta;

          if (delta?.content) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "content",
                  content: delta.content,
                })}\n\n`
              )
            );
          }

          if (chunk.choices[0]?.finish_reason) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "finish",
                  finish_reason: chunk.choices[0].finish_reason,
                })}\n\n`
              )
            );
          }

          if (chunk.usage) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "usage",
                  usage: {
                    promptTokens: chunk.usage.prompt_tokens ?? 0,
                    completionTokens: chunk.usage.completion_tokens ?? 0,
                    totalTokens: chunk.usage.total_tokens ?? 0,
                  },
                  model: chunk.model || model,
                })}\n\n`
              )
            );
          }
        }
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      } catch (error) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "error",
              error: formatLLMError(error),
            })}\n\n`
          )
        );
        controller.close();
      }
    },
    cancel() {
      try {
        (
          upstream as unknown as { controller?: { abort: () => void } }
        )?.controller?.abort?.();
      } catch {
        /* noop */
      }
    },
  });
}
