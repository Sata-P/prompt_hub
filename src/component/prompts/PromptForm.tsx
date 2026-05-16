"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { ArrowLeft, Save, ShieldAlert, Sparkles, ChevronDown, Tag as TagIcon, X } from "lucide-react";

import { Card, CardContent } from "@/component/ui/card";
import { Button } from "@/component/ui/button";
import { Input } from "@/component/ui/input";
import { Label } from "@/component/ui/label";
import { Textarea } from "@/component/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/component/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/component/ui/dropdown-menu";
import { ScrollArea } from "@/component/ui/scroll-area";
import { PROVIDER_MODELS } from "@/lib/llm";

// -------------------------------------------------------
// Types
// -------------------------------------------------------

export const VARIABLE_TYPES = ["TEXT", "TEXTAREA", "SELECT", "NUMBER", "BOOLEAN"] as const;
export type VariableType = typeof VARIABLE_TYPES[number];

export type VariableConfig = {
  name: string;
  type: VariableType;
  label: string;
  description: string;
  options: string[];
};

export type PromptFormValues = {
  title: string;
  description: string;
  categoryId: string;
  tags: string[];
  templateContent: string;
  recommendedModels: string[];
  variables: VariableConfig[];
};

type Category = { id: number; name: string };
type Tag = { id: number; name: string };
type ModelInfo = { id: string; name: string };

type Props = {
  mode: "create" | "edit";
  initialValues?: Partial<PromptFormValues>;
  backHref: string;
  backLabel: string;
  headerTitle: React.ReactNode;
  submitLabel: string;
  submitLoadingLabel: string;
  onSubmit: (values: PromptFormValues) => Promise<void>;
};

const VARIABLE_NAME_REGEX = /\{\{\s*([a-zA-Z0-9_]*)\s*\}\}/g;

function makeDefaultConfig(name: string): VariableConfig {
  return { name, type: "TEXT", label: name, description: "", options: [] };
}

// -------------------------------------------------------
// PromptForm — shared by /prompts/new and /prompts/[id]/edit
// -------------------------------------------------------
export function PromptForm({
  mode,
  initialValues,
  backHref,
  backLabel,
  headerTitle,
  submitLabel,
  submitLoadingLabel,
  onSubmit,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Core form fields
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [categoryId, setCategoryId] = useState<string>(initialValues?.categoryId ?? "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(initialValues?.tags ?? []);
  const [templateContent, setTemplateContent] = useState(initialValues?.templateContent ?? "");
  const [recommendedModels, setRecommendedModels] = useState<string[]>(
    initialValues?.recommendedModels ?? []
  );

  // Variable configs keyed by name (decoupled from detection order)
  const [variableConfigs, setVariableConfigs] = useState<Record<string, VariableConfig>>(() =>
    Object.fromEntries((initialValues?.variables ?? []).map(v => [v.name, v]))
  );

  // External lookup data
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

  // Static model list (BYOK — no API key needed)
  const models: ModelInfo[] = useMemo(
    () => [...PROVIDER_MODELS.openai, ...PROVIDER_MODELS.gemini],
    []
  );
  const modelById = useMemo(() => new Map(models.map(m => [m.id, m.name])), [models]);

  // -------------------------------------------------------
  // Load categories + tags on mount (single AbortController for cleanup)
  // -------------------------------------------------------
  useEffect(() => {
    const ctrl = new AbortController();
    Promise.all([
      axios.get<Category[]>("/api/categories", { signal: ctrl.signal }),
      axios.get<Tag[]>("/api/tags", { signal: ctrl.signal }),
    ])
      .then(([catsRes, tagsRes]) => {
        setCategories(catsRes.data ?? []);
        setAvailableTags(tagsRes.data ?? []);
      })
      .catch(err => {
        if (axios.isCancel(err)) return;
        console.error("Failed to load form context:", err);
      });
    return () => ctrl.abort();
  }, []);

  // -------------------------------------------------------
  // Variable detection — derived (no useEffect/setState mirror)
  // -------------------------------------------------------
  const variableNames = useMemo(() => {
    const matches = templateContent.matchAll(VARIABLE_NAME_REGEX);
    return Array.from(new Set(Array.from(matches, m => m[1])));
  }, [templateContent]);

  const variables: VariableConfig[] = useMemo(
    () => variableNames.map(name => variableConfigs[name] ?? makeDefaultConfig(name)),
    [variableNames, variableConfigs]
  );

  // Filtered tag list — memoized so the dropdown doesn't refilter on every render
  const filteredAvailableTags = useMemo(() => {
    const q = tagInput.toLowerCase().trim();
    if (!q) return availableTags;
    return availableTags.filter(t => t.name.toLowerCase().includes(q));
  }, [availableTags, tagInput]);

  const tagInputMatchesExisting = useMemo(
    () => availableTags.some(t => t.name.toLowerCase() === tagInput.toLowerCase()),
    [availableTags, tagInput]
  );

  // -------------------------------------------------------
  // Variable-config mutations (operate on the keyed map)
  // -------------------------------------------------------
  const updateVariable = (name: string, field: keyof VariableConfig, value: string) => {
    setVariableConfigs(prev => {
      const current = prev[name] ?? makeDefaultConfig(name);
      const next: VariableConfig =
        field === "type"
          ? { ...current, type: value as VariableType }
          : { ...current, [field]: value };
      return { ...prev, [name]: next };
    });
  };

  const addVariableOption = (varName: string, optRaw: string) => {
    const newOpts = optRaw.split(",").map(s => s.trim()).filter(s => s.length > 0);
    if (newOpts.length === 0) return;
    setVariableConfigs(prev => {
      const current = prev[varName] ?? makeDefaultConfig(varName);
      const merged = [...current.options];
      for (const o of newOpts) if (!merged.includes(o)) merged.push(o);
      return { ...prev, [varName]: { ...current, options: merged } };
    });
  };

  const removeVariableOption = (varName: string, opt: string) => {
    setVariableConfigs(prev => {
      const current = prev[varName];
      if (!current) return prev;
      return { ...prev, [varName]: { ...current, options: current.options.filter(o => o !== opt) } };
    });
  };

  const renameVariable = (oldName: string, newNameRaw: string) => {
    const newName = newNameRaw.replace(/[^a-zA-Z0-9_]/g, "");
    if (oldName === newName) return;

    // Move config from oldName → newName (preserving type/description/options)
    setVariableConfigs(prev => {
      const existing = prev[oldName] ?? makeDefaultConfig(oldName);
      const { [oldName]: _drop, ...rest } = prev;
      return {
        ...rest,
        [newName]: {
          ...existing,
          name: newName,
          label: existing.label === oldName ? newName : existing.label,
        },
      };
    });

    // Mirror the rename inside the template content so detection picks it up
    setTemplateContent(prev => {
      if (oldName === "") return prev.replace(/\{\{\s*\}\}/g, `{{${newName}}}`);
      return prev.replace(new RegExp(`\\{\\{\\s*${oldName}\\s*\\}\\}`, "g"), `{{${newName}}}`);
    });
  };

  // -------------------------------------------------------
  // Tag input handlers (functional updates everywhere)
  // -------------------------------------------------------
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    e.preventDefault();
    setTags(prev => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    setTagInput("");
  };

  const toggleTag = (name: string) => {
    setTags(prev => (prev.includes(name) ? prev.filter(t => t !== name) : [...prev, name]));
  };

  const removeTag = (name: string) => setTags(prev => prev.filter(t => t !== name));

  const toggleRecommendedModel = (id: string) => {
    setRecommendedModels(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  // -------------------------------------------------------
  // Submit
  // -------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return; // defensive guard on top of disabled attr

    if (!title.trim() || !templateContent.trim()) {
      setError("Title and template content are required.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await onSubmit({
        title,
        description,
        categoryId,
        tags,
        templateContent,
        recommendedModels,
        variables,
      });
      // success → caller is responsible for navigating away
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(mode === "create" ? "Failed to create prompt." : "Failed to update prompt.");
      }
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------
  // Render
  // -------------------------------------------------------
  return (
    <div className="pb-20">
      <main className="py-4">
        <Button
          variant="ghost"
          className="mb-6 -ml-4 transition-all duration-300 ease-in-out hover:-translate-x-1 active:scale-95"
          asChild
        >
          <Link href={backHref}>
            <ArrowLeft className="mr-2 h-4 w-4" /> {backLabel}
          </Link>
        </Button>

        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b pb-6">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                {headerTitle}
              </h1>
            </div>
            <Button
              type="submit"
              disabled={submitting}
              size="lg"
              className="h-12 px-8 text-base shadow-lg shadow-primary/20 transition-all duration-300 ease-in-out hover:scale-105 active:scale-95"
            >
              <Save className="mr-2 h-5 w-5" />
              {submitting ? submitLoadingLabel : submitLabel}
            </Button>
          </div>

          <Card className="border shadow-sm overflow-hidden">
            <CardContent className="p-6 md:p-10">
              {error && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="bg-destructive/10 text-destructive p-4 rounded-md mb-8 font-medium flex items-center gap-2"
                >
                  <ShieldAlert className="h-5 w-5" /> {error}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8 xl:gap-12 items-start">
                {/* Left: general info */}
                <div className="space-y-6 lg:sticky lg:top-6">
                  <section className="flex flex-col gap-6">
                    <div className="pb-2 border-b">
                      <h2 className="text-xl font-bold font-heading flex items-center gap-2">
                        <span className="bg-primary/10 p-1.5 rounded-md">
                          <Sparkles className="h-4 w-4 text-primary" />
                        </span>
                        General Information
                      </h2>
                    </div>

                    <div className="flex flex-col gap-8">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="title" className="text-base font-semibold">
                          Prompt Title <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="title"
                          placeholder="e.g. Write a resume, Summarize an article..."
                          value={title}
                          onChange={e => setTitle(e.target.value)}
                          className="h-11"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label htmlFor="description" className="text-sm font-semibold">
                          Description (Optional)
                        </Label>
                        <Textarea
                          id="description"
                          placeholder="Briefly describe what this prompt does..."
                          rows={2}
                          value={description}
                          onChange={e => setDescription(e.target.value)}
                          className="resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Category */}
                          <div className="flex flex-col gap-2">
                            <Label htmlFor="category" className="text-sm font-semibold">
                              Category
                            </Label>
                            <Select
                              value={categoryId || "none"}
                              onValueChange={val => setCategoryId(val === "none" ? "" : val)}
                            >
                              <SelectTrigger id="category" className="h-10 bg-background">
                                <SelectValue placeholder="-- None --" />
                              </SelectTrigger>
                              <SelectContent position="popper" side="bottom">
                                <SelectItem value="none">-- None --</SelectItem>
                                {categories.map(cat => (
                                  <SelectItem key={cat.id} value={String(cat.id)}>
                                    {cat.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Recommended models */}
                          <div className="flex flex-col gap-2">
                            <Label htmlFor="model" className="text-sm font-semibold">
                              Recommended AI Models
                            </Label>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button className="w-full justify-between h-10 px-3 bg-background border-input font-normal hover:bg-background/80 transition-all duration-300 ease-in-out hover:border-primary/50">
                                  <span className="truncate">
                                    {recommendedModels.length > 0
                                      ? recommendedModels
                                          .map(id => modelById.get(id) ?? id)
                                          .join(", ")
                                      : "-- None (use Default) --"}
                                  </span>
                                  <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="w-[300px] p-0" align="start">
                                <ScrollArea className="h-60 p-1">
                                  <DropdownMenuCheckboxItem
                                    checked={recommendedModels.length === 0}
                                    onCheckedChange={() => setRecommendedModels([])}
                                    className="focus:bg-primary/10 focus:text-primary data-[state=checked]:text-primary"
                                  >
                                    -- None (use Default) --
                                  </DropdownMenuCheckboxItem>
                                  <DropdownMenuSeparator />
                                  {models.map(m => (
                                    <DropdownMenuCheckboxItem
                                      key={m.id}
                                      checked={recommendedModels.includes(m.id)}
                                      onCheckedChange={() => toggleRecommendedModel(m.id)}
                                      onSelect={e => e.preventDefault()}
                                      className="focus:bg-primary/10 focus:text-primary data-[state=checked]:text-primary"
                                    >
                                      {m.name}
                                    </DropdownMenuCheckboxItem>
                                  ))}
                                </ScrollArea>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="tags" className="text-sm font-semibold flex items-center gap-2">
                            <TagIcon className="h-3.5 w-3.5" /> Tags
                          </Label>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button className="w-full justify-between h-10 px-3 bg-background border-input font-normal hover:bg-background/80 transition-all duration-300 ease-in-out hover:border-primary/50">
                                <span className="truncate">
                                  {tags.length > 0
                                    ? `Selected ${tags.length} tags`
                                    : "Select or add tags..."}
                                </span>
                                <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[300px] p-0" align="start">
                              <div className="p-2 border-b bg-muted/30">
                                <Input
                                  placeholder="Search or type new tag..."
                                  value={tagInput}
                                  onChange={e => setTagInput(e.target.value)}
                                  onKeyDown={handleAddTag}
                                  className="h-8 text-xs border-none bg-transparent focus-visible:ring-0 shadow-none"
                                />
                              </div>
                              <ScrollArea className="h-60 p-1">
                                {filteredAvailableTags.map(tag => (
                                  <DropdownMenuCheckboxItem
                                    key={tag.id}
                                    checked={tags.includes(tag.name)}
                                    onCheckedChange={() => toggleTag(tag.name)}
                                    onSelect={e => e.preventDefault()}
                                    className="focus:bg-primary/10 focus:text-primary data-[state=checked]:text-primary"
                                  >
                                    {tag.name}
                                  </DropdownMenuCheckboxItem>
                                ))}

                                {tagInput && !tagInputMatchesExisting && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => {
                                        const trimmed = tagInput.trim();
                                        if (trimmed) {
                                          setTags(prev =>
                                            prev.includes(trimmed) ? prev : [...prev, trimmed]
                                          );
                                        }
                                        setTagInput("");
                                      }}
                                      className="text-primary font-medium focus:bg-primary/10 focus:text-primary"
                                    >
                                      + Add new tag: &quot;{tagInput}&quot;
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </ScrollArea>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {tags.map(t => (
                                <div
                                  key={t}
                                  className="group flex items-center gap-1 bg-primary/5 text-primary/80 hover:bg-primary/10 hover:text-primary font-medium text-[11px] px-2 py-0.5 rounded-md border border-primary/10 transition-all duration-300 ease-in-out hover:scale-105 active:scale-95"
                                >
                                  {t}
                                  <button
                                    type="button"
                                    aria-label={`Remove tag ${t}`}
                                    onClick={() => removeTag(t)}
                                    className="text-primary/40 group-hover:text-primary/70 transition-colors"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Right: template + variables */}
                <div className="space-y-6">
                  <section className="flex flex-col h-full gap-6">
                    <div className="pb-2 border-b flex justify-between items-end">
                      <h2 className="text-xl font-bold font-heading flex items-center gap-2">
                        <span className="bg-primary/10 p-1.5 rounded-md">
                          <Sparkles className="h-4 w-4 text-primary" />
                        </span>
                        Template Content
                      </h2>
                    </div>
                    <div className="flex flex-col gap-6 flex-1">
                      <Textarea
                        id="templateContent"
                        placeholder="Type your prompt template here. Use {{variable}} for dynamic fields..."
                        className="font-mono text-sm leading-relaxed flex-1 min-h-[450px]"
                        value={templateContent}
                        onChange={e => setTemplateContent(e.target.value)}
                        required
                      />

                      {variables.length > 0 && (
                        <div className="bg-primary/[0.04] rounded-xl border border-primary/20 p-5 flex flex-col gap-5">
                          <div className="flex items-center gap-2 font-semibold text-base text-primary">
                            <Sparkles className="h-5 w-5" /> Detected Variables ({variables.length})
                          </div>
                          <div className="flex flex-col gap-4">
                            {variables.map(v => (
                              <div
                                key={v.name}
                                className="bg-background/60 p-3 rounded-xl border border-primary/10 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/30"
                              >
                                <div className="grid grid-cols-[1fr_2fr] gap-4 items-start">
                                  <div>
                                    <div
                                      className="font-mono text-sm font-bold text-primary mb-2 truncate"
                                      title={v.name}
                                    >
                                      {"{{"}
                                      {v.name.length > 22
                                        ? v.name.substring(0, 18) + "..."
                                        : v.name}
                                      {"}}"}
                                    </div>
                                    <select
                                      className="w-full text-xs h-8 rounded-md border border-input bg-background px-2"
                                      value={v.type}
                                      onChange={e => updateVariable(v.name, "type", e.target.value)}
                                    >
                                      <option value="TEXT">Text (TEXT)</option>
                                      <option value="TEXTAREA">Long Text (TEXTAREA)</option>
                                      <option value="SELECT">Select / Dropdown (SELECT)</option>
                                      <option value="NUMBER">Number (NUMBER)</option>
                                      <option value="BOOLEAN">Yes/No (BOOLEAN)</option>
                                    </select>
                                  </div>
                                  <div className="space-y-2">
                                    <Input
                                      placeholder="Label / Variable name in template"
                                      className="h-8 text-xs font-mono"
                                      value={v.name}
                                      onChange={e => renameVariable(v.name, e.target.value)}
                                    />
                                    <Input
                                      placeholder="Description"
                                      className="h-8 text-xs"
                                      value={v.description}
                                      onChange={e =>
                                        updateVariable(v.name, "description", e.target.value)
                                      }
                                    />
                                  </div>
                                </div>

                                {v.type === "SELECT" && (
                                  <div className="mt-3 pt-3 border-t border-primary/10">
                                    <div className="flex items-center justify-between mb-2">
                                      <Label className="text-xs font-semibold text-foreground/80">
                                        Options{" "}
                                        <span className="text-muted-foreground font-normal">
                                          (คั่นด้วย , หรือกด Enter)
                                        </span>
                                      </Label>
                                      <span className="text-[10px] text-muted-foreground">
                                        {v.options.length} item{v.options.length !== 1 ? "s" : ""}
                                      </span>
                                    </div>
                                    <Input
                                      placeholder="พิมพ์ตัวเลือก แล้วกด Enter (เช่น TH, EN, JP)"
                                      className="h-8 text-xs"
                                      onKeyDown={e => {
                                        if (e.key === "Enter") {
                                          e.preventDefault();
                                          const target = e.currentTarget;
                                          addVariableOption(v.name, target.value);
                                          target.value = "";
                                        }
                                      }}
                                    />
                                    {v.options.length > 0 ? (
                                      <div className="flex flex-wrap gap-1.5 mt-2">
                                        {v.options.map(opt => (
                                          <span
                                            key={opt}
                                            className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-xs text-primary transition-all duration-300 ease-in-out hover:scale-105"
                                          >
                                            {opt}
                                            <button
                                              type="button"
                                              aria-label={`Remove ${opt}`}
                                              onClick={() => removeVariableOption(v.name, opt)}
                                              className="hover:bg-primary/20 rounded-sm p-0.5 transition-colors"
                                            >
                                              <X className="h-3 w-3" />
                                            </button>
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-[11px] text-muted-foreground mt-2 italic">
                                        ยังไม่มีตัวเลือก — เพิ่มอย่างน้อย 1 ตัวเลือก
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  );
}
