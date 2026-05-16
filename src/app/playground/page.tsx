"use client";

import { useState, useEffect, useRef, Suspense, useCallback, useMemo, useDeferredValue } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Check,
  Copy,
  Play,
  Square,
  Zap,
  Clock,
  Coins,
  ChevronDown,
  Sparkles,
  Bot,
  Settings2,
  PlayCircle,
  Timer,
  ChevronRight,
  ChevronLeft,
  User as UserIcon,
  Search,
  X,
  FlaskConical,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/component/ui/tooltip";

import { Card, CardContent, CardHeader, CardTitle } from "@/component/ui/card";
import { Button } from "@/component/ui/button";
import { Input } from "@/component/ui/input";
import { Textarea } from "@/component/ui/textarea";
import { Skeleton } from "@/component/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/component/ui/select";
import { Badge } from "@/component/ui/badge";
import { Separator } from "@/component/ui/separator";
import { PROVIDERS, PROVIDER_MODELS, type LLMProvider } from "@/lib/llm";

// -------------------------------------------------------
// Types
// -------------------------------------------------------

type VariableInfo = {
  id: number;
  name: string;
  type: string;
  options_json?: string[] | string | null;
  description: string | null;
};

type ModelInfo = {
  id: string;
  name: string;
  owned_by?: string;
};

type UsageInfo = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

type PromptRun = {
  id: number;
  model: string | null;
  output_response: string | null;
  execution_time_ms: number | null;
  token_used: number;
  variables_input: Record<string, string> | null;
  created_at: string;
  prompt_version: { version_no: number };
  user: { name: string };
};

// -------------------------------------------------------
// PlaygroundContent — Main component
// -------------------------------------------------------

const ITEMS_PER_PAGE = 9;

function PlaygroundContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const promptId = searchParams.get("promptId");
  const versionId = searchParams.get("versionId");

  // Prompt data
  const [publicPrompts, setPublicPrompts] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [listPage, setListPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [variables, setVariables] = useState<VariableInfo[]>([]);
  const [variableValues, setVariableValues] = useState<Record<string, string>>(
    {}
  );
  const [runValues, setRunValues] = useState<Record<string, string>>({});
  const [currentVersionId, setCurrentVersionId] = useState<number | null>(null);
  const [promptTitle, setPromptTitle] = useState("");

  // LLM state — BYOK (Bring Your Own Key)
  const [provider, setProvider] = useState<LLMProvider>("openai");
  const [apiKey, setApiKey] = useState("");
  const models: ModelInfo[] = useMemo(() => PROVIDER_MODELS[provider], [provider]);
  const [selectedModel, setSelectedModel] = useState<string>(PROVIDER_MODELS.openai[0].id);
  const [isRunning, setIsRunning] = useState(false);
  const [llmResponse, setLlmResponse] = useState("");
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [responseModel, setResponseModel] = useState("");

  // UI state
  const [isCopied, setIsCopied] = useState(false);
  const [isCopiedResponse, setIsCopiedResponse] = useState(false);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [temperature, setTemperature] = useState(0.7);

  // Usage Examples state
  const [runs, setRuns] = useState<PromptRun[]>([]);
  const [runsLoading, setRunsLoading] = useState(false);
  const [selectedRun, setSelectedRun] = useState<PromptRun | null>(null);

  // Refs
  const responseRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // -------------------------------------------------------
  // Reset selected model when provider changes (if current not in list)
  // -------------------------------------------------------
  useEffect(() => {
    if (!models.some((m) => m.id === selectedModel)) {
      setSelectedModel(models[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  // -------------------------------------------------------
  // Fetch prompt data
  // -------------------------------------------------------
  useEffect(() => {
    if (!promptId) return;

    const controller = new AbortController();
    let ignored = false;

    const fetchPrompt = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/prompts/${promptId}`, {
          signal: controller.signal,
        });
        
        if (!res.ok) throw new Error("Failed to load prompt");
        
        const promptData = await res.json();
        
        if (ignored) return;

        setPromptTitle(promptData.title || "");

        let targetVersion = promptData.versions?.[0];
        if (versionId) {
          const found = promptData.versions?.find(
            (v: any) => v.id === Number(versionId)
          );
          if (found) targetVersion = found;
        }

        if (targetVersion) {
          setTemplate(targetVersion.template_content || "");
          setSystemPrompt(targetVersion.system_prompt || "");
          setVariables(targetVersion.promptVariables || []);
          setCurrentVersionId(targetVersion.id);

          // Show system prompt section if it has content
          if (targetVersion.system_prompt?.trim()) {
            setShowSystemPrompt(true);
          }

          // Initialize values to empty string
          const initialVals: Record<string, string> = {};
          (targetVersion.promptVariables || []).forEach((v: VariableInfo) => {
            initialVals[v.name] = "";
          });
          setVariableValues(initialVals);
          setRunValues(initialVals);
        }

        // Use prompt's recommended model if available AND it matches a model
        // in the currently selected provider's list
        if (
          promptData.recommended_model &&
          PROVIDER_MODELS[provider].some(
            (m) => m.id === promptData.recommended_model
          )
        ) {
          setSelectedModel(promptData.recommended_model);
        }
      } catch (error: any) {
        if (error.name === "AbortError") return;
        console.error("Error loading prompt:", error);
        toast.error("Failed to load prompt");
      } finally {
        if (!ignored) {
          setLoading(false);
        }
      }
    };

    fetchPrompt();
    
    return () => {
      ignored = true;
      controller.abort();
    };
  }, [promptId, versionId]);

  // -------------------------------------------------------
  // Fetch public prompts (when no promptId)
  // -------------------------------------------------------
  useEffect(() => {
    if (promptId) return;

    const controller = new AbortController();

    const fetchPublicPrompts = async () => {
      setLoadingList(true);
      try {
        const res = await fetch(
          "/api/prompts?visibility=PUBLIC&status=PUBLISHED&limit=20",
          { signal: controller.signal }
        );
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch public prompts (${res.status})`);
        }
        const data = await res.json();
        setPublicPrompts(data.data || []);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("Playground: Failed to fetch public prompts:", err);
        toast.error(err.message || "Could not load public prompts");
      } finally {
        if (!controller.signal.aborted) {
          setLoadingList(false);
        }
      }
    };

    fetchPublicPrompts();

    return () => {
      controller.abort();
    };
  }, [promptId]);

  // Filtered prompts by search query (uses deferred value for better input responsiveness)
  const filteredPrompts = useMemo(() => {
    const q = deferredSearch.toLowerCase().trim();
    if (!q) return publicPrompts;
    return publicPrompts.filter(p =>
      (p.title || "").toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q) ||
      (p.category?.name || "").toLowerCase().includes(q) ||
      (p.tags || []).some((t: any) => (t.name || "").toLowerCase().includes(q))
    );
  }, [publicPrompts, deferredSearch]);

  // Paginated slice of filtered prompts
  const totalListPages = Math.ceil(filteredPrompts.length / ITEMS_PER_PAGE);
  const pagedPrompts = useMemo(() => {
    const start = (listPage - 1) * ITEMS_PER_PAGE;
    return filteredPrompts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPrompts, listPage, ITEMS_PER_PAGE]);

  // Fetch successful runs when promptId changes
  useEffect(() => {
    if (!promptId) { setRuns([]); setSelectedRun(null); return; }
    
    let ignored = false;
    setRunsLoading(true);
    
    fetch(`/api/prompts/${promptId}/runs?limit=5`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch runs");
        return res.json();
      })
      .then((data: PromptRun[]) => {
        if (ignored) return;
        setRuns(data);
        if (data.length > 0) setSelectedRun(data[0]);
        else setSelectedRun(null);
      })
      .catch(() => { 
        if (!ignored) {
          setRuns([]); 
          setSelectedRun(null); 
        }
      })
      .finally(() => {
        if (!ignored) {
          setRunsLoading(false);
        }
      });
      
    return () => {
      ignored = true;
    };
  }, [promptId]);

  // -------------------------------------------------------
  // Auto-scroll response
  // -------------------------------------------------------
  useEffect(() => {
    if (responseRef.current && isRunning) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [llmResponse, isRunning]);

  // -------------------------------------------------------
  // Render prompt with variables
  // -------------------------------------------------------
  const renderPrompt = useCallback(
    (values: Record<string, string>) => {
      return template.replace(/\{\{([^}]+)\}\}/g, (match, varName) => {
        const trimmedName = varName.trim();
        return values[trimmedName] !== undefined && values[trimmedName] !== ""
          ? values[trimmedName]
          : match;
      });
    },
    [template]
  );

  // Live preview: render with the user's current inputs (variableValues),
  // not the last-run snapshot (runValues), so the Rendered Prompt panel
  // updates immediately as the user types/selects variables - no need to
  // press Run just to see the substituted output.
  const renderedPrompt = renderPrompt(variableValues);

  // -------------------------------------------------------
  // Copy handlers
  // -------------------------------------------------------
  const handleCopy = () => {
    navigator.clipboard.writeText(renderedPrompt);
    setIsCopied(true);
    toast.success("Prompt copied");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(llmResponse);
    setIsCopiedResponse(true);
    toast.success("Response copied");
    setTimeout(() => setIsCopiedResponse(false), 2000);
  };

  // -------------------------------------------------------
  // Stop generation
  // -------------------------------------------------------
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsRunning(false);
  };

  // -------------------------------------------------------
  // Run Prompt — เรียก LLM API พร้อม streaming
  // -------------------------------------------------------
  const handleRunPrompt = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter your API key to run the prompt");
      return;
    }
    // Capture key locally and IMMEDIATELY clear from state — never persist anywhere
    const keyForThisRun = apiKey;
    setApiKey("");

    setIsRunning(true);
    setLlmResponse("");
    setUsage(null);
    setExecutionTime(null);
    setResponseModel("");

    // อัพเดต rendered prompt ด้วย values ล่าสุด
    const currentValues = { ...variableValues };
    setRunValues(currentValues);
    const newRenderedPrompt = renderPrompt(currentValues);

    const startTime = Date.now();

    // สร้าง AbortController สำหรับ cancel
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch("/api/playground/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptId: promptId ? Number(promptId) : null,
          versionId: currentVersionId,
          rendered_prompt: newRenderedPrompt,
          system_prompt: systemPrompt,
          variables_input: currentValues,
          provider,
          apiKey: keyForThisRun,
          model: selectedModel,
          temperature,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "LLM request failed");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split("\n").filter((line) => line.trim() !== "");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.replace("data: ", "");

          if (jsonStr === "[DONE]") continue;

          try {
            const parsed = JSON.parse(jsonStr);

            switch (parsed.type) {
              case "meta":
                // server บอกว่าใช้ model อะไรจริง (สำคัญเวลาโดน fallback)
                if (parsed.model) setResponseModel(parsed.model);
                break;
              case "content":
                accumulated += parsed.content;
                setLlmResponse(accumulated);
                break;
              case "usage":
                setUsage(parsed.usage);
                setResponseModel(parsed.model || selectedModel);
                break;
              case "error":
                toast.error(`LLM Error: ${parsed.error}`);
                break;
            }
          } catch {
            // ignore parse errors from partial chunks
          }
        }
      }

      setExecutionTime(Date.now() - startTime);
      toast.success("Prompt run successfully");
    } catch (error: any) {
      if (error.name === "AbortError") {
        toast.info("Execution stopped");
        setExecutionTime(Date.now() - startTime);
      } else {
        // Use console.warn (not console.error) to avoid the Next.js dev
        // error overlay popping up for expected user-fixable issues
        // (wrong API key, quota exceeded, invalid model, etc.).
        // The toast already surfaces the message clearly to the user.
        console.warn("Run prompt error:", error?.message || error);
        toast.error(error.message || "An error occurred while running the prompt");
      }
    } finally {
      setIsRunning(false);
      abortControllerRef.current = null;
    }
  };

  // -------------------------------------------------------
  // Prompt selection view (no promptId)
  // -------------------------------------------------------
  if (!promptId) {
    return (
      <div className="pb-20 max-w-6xl mx-auto space-y-6 pt-4 px-4 fade-in-up">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="h-8 w-8 rounded-[10px] bg-primary flex items-center justify-center">
                <PlayCircle className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
                Prompt Playground
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Select a Prompt to test with an AI Model
            </p>
          </div>
          {!loadingList && publicPrompts.length > 0 && (
            <div className="shrink-0 flex items-center gap-1.5 bg-primary/10 text-primary text-sm font-medium px-3.5 py-1.5 rounded-full">
              <FlaskConical className="h-3.5 w-3.5" />
              {filteredPrompts.length} prompt{filteredPrompts.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* Search bar */}
        {!loadingList && publicPrompts.length > 0 && (
          <div className="relative mb-6 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search prompts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-9 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {search && (
              <button
                onClick={() => { setSearch(""); setListPage(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {loadingList ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        ) : publicPrompts.length === 0 ? (
          <div className="text-center py-20 border rounded-xl bg-card/50 border-dashed">
            <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              No public prompts found at this moment
            </p>
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="text-center py-20 border rounded-xl bg-card/50 border-dashed">
            <Search className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No results for &ldquo;{search}&rdquo;
            </p>
            <button
              onClick={() => setSearch("")}
              className="mt-2 text-xs text-primary hover:underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pagedPrompts.map((p) => (
                <Card
                  key={p.id}
                  className="flex flex-col border hover:!border-[#FF6B00] hover:!shadow-[0_0_15px_rgba(255,107,0,0.3)] cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-95 bg-card group hover:cursor-pointer min-h-[160px]"
                  onClick={() => router.push(`/playground?promptId=${p.id}`)}
                >
                  <CardHeader>
                    <TooltipProvider>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <CardTitle className="text-lg line-clamp-1 text-foreground group-hover:text-primary transition-colors text-left cursor-help">
                            {p.title}
                          </CardTitle>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[300px]">
                          <p className="font-semibold">{p.title}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </CardHeader>
                  <CardContent className="flex-1">
                    {p.description ? (
                      <TooltipProvider>
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger asChild>
                            <p className="text-sm text-muted-foreground line-clamp-2 text-left cursor-help">
                              {p.description}
                            </p>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="max-w-[300px] text-sm whitespace-pre-wrap">
                            <p>{p.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <p className="text-sm text-muted-foreground/60 italic text-left">
                        No description available
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination controls */}
            {totalListPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Page {listPage} of {totalListPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={listPage <= 1}
                    onClick={() => setListPage(p => p - 1)}
                    className="transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={listPage >= totalListPages}
                    onClick={() => setListPage(p => p + 1)}
                    className="transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // -------------------------------------------------------
  // Main Playground UI
  // -------------------------------------------------------
  return (
    <div className="pb-20 max-w-7xl mx-auto space-y-5 pt-4 px-4 fade-in-up">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-heading truncate">
              {promptTitle || "Prompt Playground"}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Enter variables, select a model, and click Run to test with AI
          </p>
        </div>

        {/* Provider + Model + Settings */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Select value={provider} onValueChange={(v) => setProvider(v as LLMProvider)}>
            <SelectTrigger className="w-full sm:w-[140px] md:w-[160px] h-9 bg-background">
              <SelectValue placeholder="Provider" />
            </SelectTrigger>
            <SelectContent>
              {PROVIDERS.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 flex-1 sm:flex-none">
            <Bot className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-full sm:w-[180px] md:w-[200px] h-9 bg-background">
                <SelectValue placeholder="Select Model" />
              </SelectTrigger>
              <SelectContent>
                {models.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0 transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 hover:border-primary hover:text-primary"
            onClick={() => setShowSystemPrompt(!showSystemPrompt)}
            title="System Prompt Settings"
          >
            <Settings2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* BYOK API Key Input */}
      <Card className="shadow-sm border border-amber-300/60 bg-amber-50/40 dark:bg-amber-950/10">
        <CardContent className="py-3 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              {PROVIDERS.find((p) => p.id === provider)?.name} API Key
            </div>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">
              Your key is sent only for this request and is never stored.
            </p>
          </div>
          <Input
            type="password"
            autoComplete="off"
            spellCheck={false}
            placeholder={
              PROVIDERS.find((p) => p.id === provider)?.keyHint ?? "API Key"
            }
            value={apiKey}
            onChange={(e) => {
              const sanitized = e.target.value
                .replace(/[\u2012\u2013\u2014\u2015]/g, "-")
                .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
                .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
                .replace(/[^\x20-\x7E]/g, "");
              setApiKey(sanitized);
            }}
            className="w-full sm:w-[280px] md:w-[320px] h-9 bg-background font-mono text-xs"
          />
        </CardContent>
      </Card>

      {/* System Prompt (collapsible) */}
      {showSystemPrompt && (
        <Card className="shadow-sm border border-primary/20 bg-primary/[0.02]">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              System Prompt
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <Textarea
              placeholder="Set System Prompt for AI (e.g., 'You are an expert in...')"
              className="min-h-[80px] resize-y bg-white text-sm"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
            />
            {/* Temperature slider */}
            <div className="mt-3 flex items-center gap-3">
              <label className="text-xs text-muted-foreground whitespace-nowrap">
                Temperature
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="flex-1 h-1.5 accent-primary"
              />
              <span className="text-xs font-mono text-muted-foreground w-8 text-right">
                {temperature.toFixed(1)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Layout: Top 2, Bottom 1 */}
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left: Variables */}
          <Card className="shadow-sm flex flex-col lg:col-span-4 min-h-[300px] sm:min-h-[350px]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Variables</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 flex-1 flex flex-col">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : variables.length === 0 ? (
              <div className="bg-muted/50 border border-border border-dashed rounded-lg flex items-center justify-center h-32 text-muted-foreground text-xs text-center px-4">
                No variables for this prompt
              </div>
            ) : (
              <div className="space-y-2.5 flex-1 overflow-auto px-0.5">
                {variables.map((v) => {
                  const typeUpper = (v.type || "").toUpperCase();
                  const isSelect = typeUpper === "SELECT";
                  const isMultiline =
                    typeUpper === "TEXTAREA" ||
                    v.name.toLowerCase().includes("content");
                  let options: string[] = [];
                  if (Array.isArray(v.options_json)) {
                    options = v.options_json as string[];
                  } else if (typeof v.options_json === "string") {
                    try {
                      const parsed = JSON.parse(v.options_json);
                      if (Array.isArray(parsed)) options = parsed;
                    } catch {
                      /* ignore */
                    }
                  }
                  return (
                    <div key={v.id} className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-muted-foreground">
                        {v.name}
                        {v.description && (
                          <span
                            className="ml-1 text-muted-foreground/60"
                            title={v.description}
                          >
                            ⓘ
                          </span>
                        )}
                      </label>
                      {isSelect ? (
                        <select
                          className="h-9 bg-background text-sm rounded-md border border-input px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          value={variableValues[v.name] || ""}
                          onChange={(e) =>
                            setVariableValues((prev) => ({
                              ...prev,
                              [v.name]: e.target.value,
                            }))
                          }
                        >
                          <option value="">-- Select --</option>
                          {options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : isMultiline ? (
                        <Textarea
                          placeholder={v.name}
                          className="min-h-[100px] sm:min-h-[120px] resize-y bg-background text-sm"
                          value={variableValues[v.name] || ""}
                          onChange={(e) =>
                            setVariableValues((prev) => ({
                              ...prev,
                              [v.name]: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        <Input
                          placeholder={v.name}
                          className="h-9 bg-background text-sm"
                          value={variableValues[v.name] || ""}
                          onChange={(e) =>
                            setVariableValues((prev) => ({
                              ...prev,
                              [v.name]: e.target.value,
                            }))
                          }
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Run / Stop Button */}
            <div className="pt-3 mt-auto">
              {isRunning ? (
                <Button
                  className="w-full h-11 font-semibold transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-95"
                  variant="destructive"
                  onClick={handleStop}
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              ) : (
                <Button
                  className="w-full h-11 font-semibold shadow-lg shadow-primary/20 transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-95"
                  onClick={handleRunPrompt}
                  disabled={!selectedModel || !apiKey.trim()}
                  title={!apiKey.trim() ? "Enter your API key first" : undefined}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Run Prompt
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right: Rendered Prompt */}
        <Card className="shadow-sm flex flex-col lg:col-span-8 min-h-[300px] sm:min-h-[350px]">
          <CardHeader className="pb-3 px-4 sm:px-6">
            <div className="flex flex-row items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">
                  Rendered Prompt
                </CardTitle>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 hidden sm:inline-flex">
                  live
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1.5 text-xs transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 hover:bg-primary/5 hover:border-primary/30"
                onClick={handleCopy}
                disabled={!renderedPrompt}
                title="Copy Rendered Prompt to clipboard"
              >
                {isCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-green-600 hidden sm:inline">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Copy</span>
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 relative mx-4 sm:mx-6 mb-4">
            {loading ? (
              <div className="p-5">
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-4 w-[90%] mb-3" />
                <Skeleton className="h-4 w-[95%] mb-3" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <div className="absolute inset-0 overflow-auto rounded-lg bg-muted/30 shadow-inner border border-border/50 px-3 sm:px-4 py-3 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed font-mono text-white">
                {renderedPrompt || (
                  <span className="text-muted-foreground italic text-xs">
                    prompt preview...
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        </div>

        {/* Bottom: LLM Response */}
        <Card className="shadow-sm flex flex-col min-h-[400px] w-full">
          <CardHeader className="pb-3 px-4 sm:px-6">
            <div className="flex flex-row items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">
                  AI Response
                </CardTitle>
                {isRunning && (
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] sm:text-xs text-primary animate-pulse font-medium">
                      generating...
                    </span>
                  </div>
                )}
              </div>
              {llmResponse && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 hover:text-primary hover:bg-primary/10"
                  onClick={handleCopyResponse}
                  title="Copy Response"
                >
                  {isCopiedResponse ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col relative mx-4 sm:mx-6 mb-16">
            {/* Response Content */}
            <div
              ref={responseRef}
              className="absolute inset-0 overflow-auto rounded-lg bg-gradient-to-b from-primary/[0.02] to-transparent shadow-inner border border-border/50 px-3 sm:px-4 py-3 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed text-white"
            >
              {llmResponse ? (
                llmResponse
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50 text-center px-4">
                  <Bot className="h-8 w-8 sm:h-10 sm:w-10 mb-3 opacity-30" />
                  <span className="text-[10px] sm:text-xs">
                    Click Run Prompt to see the AI response
                  </span>
                </div>
              )}
            </div>

            {/* Metrics Bar */}
            <div className="absolute -bottom-14 left-0 right-0 py-3">
              {(usage || executionTime) && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] sm:text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 border">
                  {responseModel && (
                    <div className="flex items-center gap-1">
                      <Bot className="h-3 w-3" />
                      <span className="font-medium">{responseModel}</span>
                    </div>
                  )}
                  {executionTime !== null && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {executionTime >= 1000
                          ? `${(executionTime / 1000).toFixed(1)}s`
                          : `${executionTime}ms`}
                      </span>
                    </div>
                  )}
                  {usage && (
                    <>
                      <div className="flex items-center gap-1">
                        <Coins className="h-3 w-3" />
                        <span>{usage.totalTokens} tokens</span>
                      </div>
                      <span className="text-muted-foreground/50 hidden sm:inline">
                        ({usage.promptTokens}↑ {usage.completionTokens}↓)
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Examples (Successful Runs) */}
      <div className="mt-8 sm:mt-10">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Usage Examples</h2>
          <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {runs.length} run{runs.length !== 1 ? "s" : ""}
          </span>
        </div>

        {runsLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-4">
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />)}
            </div>
            <div className="h-48 rounded-lg bg-muted animate-pulse" />
          </div>
        ) : runs.length === 0 ? (
          <div className="border border-dashed rounded-xl p-8 text-center bg-card/30">
            <Zap className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-xs font-medium text-foreground mb-1">No runs yet</p>
            <p className="text-[10px] text-muted-foreground">Successful executions will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-4 items-start">

            {/* Left: selector (Scrollable horizontal on mobile, vertical on desktop) */}
            <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
              {runs.map((run, idx) => {
                const isActive = selectedRun?.id === run.id;
                return (
                  <button
                    key={run.id}
                    onClick={() => setSelectedRun(run)}
                    className={`shrink-0 w-[180px] lg:w-full text-left px-3 py-2.5 rounded-lg border transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-95 ${
                      isActive
                        ? "bg-primary/10 border-primary/40 shadow-sm"
                        : "bg-card border-border hover:bg-muted/40 hover:border-muted-foreground/20"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Bot className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`text-[11px] sm:text-xs font-semibold truncate ${isActive ? "text-primary" : "text-foreground"}`}>
                        {run.model || "Unknown"}
                      </span>
                      <span className="text-[9px] text-muted-foreground ml-auto shrink-0">#{idx + 1}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      {run.execution_time_ms != null && (
                        <span className="flex items-center gap-0.5">
                          <Timer className="h-2.5 w-2.5" />
                          {run.execution_time_ms < 1000 ? `${run.execution_time_ms}ms` : `${(run.execution_time_ms / 1000).toFixed(1)}s`}
                        </span>
                      )}
                      <span className="ml-auto shrink-0">v{run.prompt_version.version_no}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right: detail */}
            {selectedRun && (() => {
              const run = selectedRun;
              const hasVars = run.variables_input && Object.keys(run.variables_input).length > 0;
              return (
                <div className="border rounded-xl bg-card shadow-sm overflow-hidden min-w-0">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 border-b bg-muted/30">
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] sm:text-xs font-semibold">
                      <Bot className="h-3 w-3" />{run.model || "Unknown"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">v{run.prompt_version.version_no}</span>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <UserIcon className="h-3 w-3" />{run.user.name}
                    </span>
                    <span className="hidden sm:flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(run.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                    </span>
                  </div>
                  <div className="p-4 space-y-4">
                    {hasVars && (
                      <div>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Inputs</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(run.variables_input!).map(([k, v]) => (
                            <span key={k} className="text-[10px] sm:text-xs bg-muted px-2 py-1 rounded-md">
                              <span className="font-mono text-primary truncate max-w-[100px] inline-block align-bottom">{`{{${k}}}`}</span>
                              <span className="text-muted-foreground"> = </span>
                              <span className="text-foreground truncate max-w-[150px] inline-block align-bottom">{String(v)}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Output</p>
                      <div className="bg-muted/50 rounded-lg p-3 sm:p-4 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto border">
                        {run.output_response || "—"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Playground Page
 * Main content is wrapped in Suspense to support searchParams reading
 */
export default function PlaygroundPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-10">
          <Skeleton className="h-10 w-48" />
        </div>
      }
    >
      <PlaygroundContent />
    </Suspense>
  );
}
