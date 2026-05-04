"use client";

import { useState, useEffect, useRef, Suspense, useCallback } from "react";
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
  FlaskConical,
  Timer,
  ChevronRight,
  User as UserIcon,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

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

// -------------------------------------------------------
// Types
// -------------------------------------------------------

type VariableInfo = {
  id: number;
  name: string;
  type: string;
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

function PlaygroundContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const promptId = searchParams.get("promptId");
  const versionId = searchParams.get("versionId");

  // Prompt data
  const [publicPrompts, setPublicPrompts] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(false);
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

  // LLM state
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [defaultModel, setDefaultModel] = useState("");
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
  // Fetch models on mount
  // -------------------------------------------------------
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await axios.get("/api/llm/models");
        setModels(res.data.models || []);
        setDefaultModel(res.data.defaultModel || "");
        if (!selectedModel) {
          setSelectedModel(res.data.defaultModel || "");
        }
      } catch (err) {
        console.error("Failed to fetch models:", err);
        // Fallback
        setSelectedModel("qwen-model");
      }
    };
    fetchModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------------------------------------------
  // Fetch prompt data
  // -------------------------------------------------------
  useEffect(() => {
    if (!promptId) return;

    const fetchPrompt = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/prompts/${promptId}`);
        const promptData = res.data;

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

        // Use prompt's recommended model if available
        if (promptData.recommended_model) {
          setSelectedModel(promptData.recommended_model);
        }
      } catch (error) {
        console.error("Error loading prompt:", error);
        toast.error("Failed to load prompt");
      } finally {
        setLoading(false);
      }
    };

    fetchPrompt();
  }, [promptId, versionId]);

  // -------------------------------------------------------
  // Fetch public prompts (when no promptId)
  // -------------------------------------------------------
  useEffect(() => {
    if (promptId) return;

    const fetchPublicPrompts = async () => {
      setLoadingList(true);
      try {
        const res = await axios.get(
          "/api/prompts?visibility=PUBLIC&status=PUBLISHED&limit=20"
        );
        setPublicPrompts(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch public prompts:", err);
      } finally {
        setLoadingList(false);
      }
    };

    fetchPublicPrompts();
  }, [promptId]);

  // Fetch successful runs when promptId changes
  useEffect(() => {
    if (!promptId) { setRuns([]); setSelectedRun(null); return; }
    setRunsLoading(true);
    axios.get<PromptRun[]>(`/api/prompts/${promptId}/runs?limit=5`)
      .then(res => {
        setRuns(res.data);
        if (res.data.length > 0) setSelectedRun(res.data[0]);
        else setSelectedRun(null);
      })
      .catch(() => { setRuns([]); setSelectedRun(null); })
      .finally(() => setRunsLoading(false));
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

  const renderedPrompt = renderPrompt(runValues);

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
        console.error("Run prompt error:", error);
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <FlaskConical className="h-4 w-4 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
                Prompt Playground
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Select a Prompt to test with an AI Model
            </p>
          </div>
        </div>

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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicPrompts.map((p) => (
              <Card
                key={p.id}
                className="hover:border-primary/50 cursor-pointer transition-all hover:shadow-md bg-card group"
                onClick={() => router.push(`/playground?promptId=${p.id}`)}
              >
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-1 text-foreground group-hover:text-primary transition-colors">
                    {p.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {p.description || "No description available"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
              {promptTitle || "Prompt Playground"}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Enter variables, select a model, and click Run to test with AI
          </p>
        </div>

        {/* Model Selector & Settings */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-[200px] h-9 bg-background">
                <SelectValue placeholder="Select Model" />
              </SelectTrigger>
              <SelectContent>
                {models.length > 0 ? (
                  models.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <div className="flex items-center gap-2">
                        <span>{m.name}</span>
                        {m.id === defaultModel && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1 py-0"
                          >
                            default
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value={selectedModel || "qwen-model"}>
                    {selectedModel || "qwen-model"}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => setShowSystemPrompt(!showSystemPrompt)}
            title="System Prompt Settings"
          >
            <Settings2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

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

      {/* Main Layout: 3-column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Variables */}
        <Card className="shadow-sm flex flex-col lg:col-span-3">
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
                  const isMultiline =
                    v.type?.toLowerCase() === "textarea" ||
                    v.name.toLowerCase().includes("content");
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
                      {isMultiline ? (
                        <Textarea
                          placeholder={v.name}
                          className="min-h-[120px] resize-y bg-background text-sm"
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
                  className="w-full h-11 font-semibold transition-transform active:scale-95"
                  variant="destructive"
                  onClick={handleStop}
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              ) : (
                <Button
                  className="w-full h-11 font-semibold shadow-lg shadow-primary/20 transition-transform active:scale-95"
                  onClick={handleRunPrompt}
                  disabled={!selectedModel}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Run Prompt
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Center: Rendered Prompt */}
        <Card className="shadow-sm flex flex-col lg:col-span-4 min-h-[450px]">
          <CardHeader className="pb-3">
            <div className="flex flex-row items-center justify-between w-full">
              <CardTitle className="text-sm font-medium">
                Rendered Prompt
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground"
                onClick={handleCopy}
                title="Copy Rendered Prompt"
              >
                {isCopied ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 relative">
            {loading ? (
              <div className="p-5">
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-4 w-[90%] mb-3" />
                <Skeleton className="h-4 w-[95%] mb-3" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <div className="absolute inset-x-4 top-0 bottom-4 overflow-auto rounded-lg bg-muted/30 shadow-inner border border-border/50 px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed font-mono text-muted-foreground">
                {renderedPrompt || (
                  <span className="text-muted-foreground italic text-xs">
                    prompt preview...
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: LLM Response */}
        <Card className="shadow-sm flex flex-col lg:col-span-5 min-h-[450px]">
          <CardHeader className="pb-3">
            <div className="flex flex-row items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">
                  AI Response
                </CardTitle>
                {isRunning && (
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs text-primary animate-pulse font-medium">
                      generating...
                    </span>
                  </div>
                )}
              </div>
              {llmResponse && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground"
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
          <CardContent className="p-0 flex-1 flex flex-col relative">
            {/* Response Content */}
            <div
              ref={responseRef}
              className="absolute inset-x-4 top-0 bottom-16 overflow-auto rounded-lg bg-gradient-to-b from-primary/[0.02] to-transparent shadow-inner border border-border/50 px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed text-foreground"
            >
              {llmResponse ? (
                llmResponse
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50">
                  <Bot className="h-10 w-10 mb-3 opacity-30" />
                  <span className="text-xs">
                    Click Run Prompt to see the AI response
                  </span>
                </div>
              )}
            </div>

            {/* Metrics Bar */}
            <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
              {(usage || executionTime) && (
                <div className="flex items-center gap-4 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 border">
                  {responseModel && (
                    <div className="flex items-center gap-1">
                      <Bot className="h-3 w-3" />
                      <span className="font-medium">{responseModel}</span>
                    </div>
                  )}
                  {responseModel && (usage || executionTime) && (
                    <Separator orientation="vertical" className="h-3" />
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
                      <span className="text-muted-foreground/50">
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
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Usage Examples</h2>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {runs.length} successful run{runs.length !== 1 ? "s" : ""}
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
          <div className="border border-dashed rounded-xl p-8 text-center">
            <Zap className="h-7 w-7 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground mb-1">No runs yet</p>
            <p className="text-xs text-muted-foreground">Run this prompt above — successful executions will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-4 items-start">

            {/* Left: selector */}
            <div className="flex flex-col gap-1.5">
              {runs.map((run, idx) => {
                const isActive = selectedRun?.id === run.id;
                return (
                  <button
                    key={run.id}
                    onClick={() => setSelectedRun(run)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all ${
                      isActive
                        ? "bg-primary/10 border-primary/40 shadow-sm"
                        : "bg-card border-border hover:bg-muted/40 hover:border-muted-foreground/20"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Bot className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`text-xs font-semibold truncate ${isActive ? "text-primary" : "text-foreground"}`}>
                        {run.model || "Unknown"}
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-auto shrink-0">#{idx + 1}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      {run.execution_time_ms != null && (
                        <span className="flex items-center gap-0.5">
                          <Timer className="h-3 w-3" />
                          {run.execution_time_ms < 1000 ? `${run.execution_time_ms}ms` : `${(run.execution_time_ms / 1000).toFixed(1)}s`}
                        </span>
                      )}
                      {run.token_used > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Coins className="h-3 w-3" />
                          {Math.round(run.token_used)}
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
                <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
                  <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 border-b bg-muted/30">
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      <Bot className="h-3 w-3" />{run.model || "Unknown"}
                    </span>
                    <span className="text-xs text-muted-foreground">v{run.prompt_version.version_no}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <UserIcon className="h-3 w-3" />{run.user.name}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(run.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                    </span>
                    <span className="ml-auto flex items-center gap-3">
                      {run.execution_time_ms != null && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Timer className="h-3 w-3" />
                          {run.execution_time_ms < 1000 ? `${run.execution_time_ms}ms` : `${(run.execution_time_ms / 1000).toFixed(2)}s`}
                        </span>
                      )}
                      {run.token_used > 0 && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Coins className="h-3 w-3" />{Math.round(run.token_used)} tokens
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="p-4 space-y-3">
                    {hasVars && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Inputs</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(run.variables_input!).map(([k, v]) => (
                            <span key={k} className="text-xs bg-muted px-2.5 py-1 rounded-md">
                              <span className="font-mono text-primary">{`{{${k}}}`}</span>
                              <span className="text-muted-foreground"> = </span>
                              <span className="text-foreground">{String(v)}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Output</p>
                      <div className="bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto border">
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
