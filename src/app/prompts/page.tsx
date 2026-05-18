"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { Plus, Search, X, FileText, ChevronLeft, ChevronRight, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/component/ui/button";
import { Input } from "@/component/ui/input";
import { Badge } from "@/component/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/component/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/component/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/component/ui/command";
import { Skeleton } from "@/component/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/component/ui/tooltip";
import { cn } from "@/lib/utils";
import { PROVIDER_MODELS } from "@/lib/llm";
import { useSession } from "next-auth/react";

type Category = { id: number; name: string };
type Tag = { id: number; name: string };

type Prompt = {
  id: number;
  title: string;
  description: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | "REVIEW" | "REJECTED";
  owner_id: number;
  latest_version_no: number;
  created_at: string;
  updated_at: string;
  category: { id: number; name: string } | null;
  tags: { id: number; name: string }[];
  recommended_models: string[] | null;
};

/**
 * หน้าแสดงรายการ Prompts ทั้งหมด
 * รองรับการกรองตามหมวดหมู่ (Category), สถานะ (Status), โมเดล (Model), แท็ก (Tag) และช่องค้นหา (Search)
 */
const STATUS_VALUES = new Set(["draft", "review", "published", "rejected", "archived"]);

export default function PromptsList() {
  const { data: session } = useSession();
  const isAdminOrEditor = session?.user?.role === "ADMIN" || session?.user?.role === "EDITOR";
  const currentUserId = session?.user?.id ? Number(session.user.id) : null;
  const searchParams = useSearchParams();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [availableModels, setAvailableModels] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });

  // Seed the status filter from `?status=...` so dashboard cards can deep-link.
  const initialStatus = (() => {
    const raw = searchParams.get("status")?.toLowerCase();
    return raw && STATUS_VALUES.has(raw) ? raw : "all";
  })();

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState(initialStatus);
  const [filterModel, setFilterModel] = useState("all");
  const [filterTags, setFilterTags] = useState<string[]>([]);

  // Debounce search input (300ms) so we don't hit the API on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Load categories and tags once
  useEffect(() => { 
    Promise.all([
      axios.get<Category[]>("/api/categories"),
      axios.get<Tag[]>("/api/tags"),
    ]).then(([catsRes, tagsRes]) => {
      setCategories(catsRes.data || []);
      setTags(tagsRes.data || []);
      // Static union of supported provider models (no API call — no key needed)
      setAvailableModels([...PROVIDER_MODELS.openai, ...PROVIDER_MODELS.gemini]);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        const searchParams = new URLSearchParams();
        searchParams.append("page", String(page));
        searchParams.append("limit", "20");
        
        if (debouncedSearchQuery) searchParams.append("q", debouncedSearchQuery);
        if (filterCategory !== "all") searchParams.append("categoryId", filterCategory);
        if (filterStatus !== "all") searchParams.append("status", filterStatus.toUpperCase());
        if (filterModel !== "all") searchParams.append("model", filterModel);
        if (filterTags.length > 0) {
          filterTags.forEach(t => searchParams.append("tag", t));
        }

        const res = await fetch(`/api/prompts?${searchParams.toString()}`, {
          signal: controller.signal,
        });

        if (!res.ok) throw new Error("Failed to load prompts");

        const data = await res.json();

        setPrompts(data.data);
        setPagination(data.pagination);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        console.error("Failed to load prompts", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, [debouncedSearchQuery, filterCategory, filterStatus, filterModel, filterTags, page]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery, filterCategory, filterStatus, filterModel, filterTags]);

  // Owner sees every workflow state. Admin/Editor sees REVIEW/REJECTED on
  // others' prompts (they can act on those). Everyone else only ever sees the
  // PUBLISHED version on the detail page, so the badge says APPROVED.
  const displayStatusFor = (p: Prompt): Prompt["status"] => {
    if (currentUserId === p.owner_id) return p.status;
    if (isAdminOrEditor && (p.status === "REVIEW" || p.status === "REJECTED")) return p.status;
    return "PUBLISHED";
  };

  const getStatusText = (status: Prompt["status"]) => {
    switch (status) {
      case "PUBLISHED": return "APPROVED";
      default: return status;
    }
  };

  const hasActiveFilters =
    filterCategory !== "all" ||
    filterStatus !== "all" ||
    filterModel !== "all" ||
    filterTags.length > 0 ||
    searchQuery !== "";

  const clearFilters = () => {
    setSearchQuery("");
    setFilterCategory("all");
    setFilterStatus("all");
    setFilterModel("all");
    setFilterTags([]);
  };

  const modelNameMap = Object.fromEntries(
    [...PROVIDER_MODELS.openai, ...PROVIDER_MODELS.gemini].map((m) => [m.id, m.name])
  );

  return (
    <TooltipProvider>
    <div className="pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-[12px] bg-primary flex items-center justify-center h-8 w-8 xl:h-10 xl:w-10">
              <FileText className="h-4 w-4 xl:h-5 xl:w-5 text-white" />
            </div>
            <h1 className="text-2xl xl:text-3xl 2xl:text-4xl font-bold text-foreground">
              Prompt Library
            </h1>
          </div>
          <p className="mt-1 text-sm xl:text-base text-muted-foreground">Search, filter and manage prompts in the system</p>
        </div>
        <Link href="/prompts/new" className="w-full sm:w-auto block">
          <Button className="w-full sm:w-auto xl:h-11 xl:text-base xl:px-6 transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-95">
            <Plus className="mr-2 h-4 w-4 xl:h-5 xl:w-5" />
            New Prompt
          </Button>
        </Link>
      </div>

      {/* แถบตัวกรอง */}
      <div data-slot="card" className="mt-6 rounded-2xl p-4 sm:p-5 xl:p-6 shadow-sm border bg-card transition-all duration-500 hover:shadow-md space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
          {/* Search */}
          <div className="relative sm:col-span-2 lg:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search prompts..."
              className="pl-9 h-11 sm:h-12 bg-background text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category */}
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="h-11 sm:h-12 bg-background">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-11 sm:h-12 bg-background">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {!isAdminOrEditor && (
                <SelectItem value="draft">DRAFT</SelectItem>
              )}
              {isAdminOrEditor && (
                <SelectItem value="review">REVIEW</SelectItem>
              )}
              <SelectItem value="published">APPROVED</SelectItem>
              {!isAdminOrEditor && (
                <SelectItem value="rejected">REJECTED</SelectItem>
              )}
              <SelectItem value="archived">ARCHIVED</SelectItem>
            </SelectContent>
          </Select>

          {/* Model */}
          <Select value={filterModel} onValueChange={setFilterModel}>
            <SelectTrigger className="h-11 sm:h-12 bg-background">
              <SelectValue placeholder="All Models" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Models</SelectItem>
              {availableModels.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Row 2: Tag filter + clear */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:min-h-[48px]">
          <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
            <span className="text-sm xl:text-base text-muted-foreground font-medium">Tags:</span>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full sm:w-[220px] xl:w-[260px] justify-between text-sm h-11 sm:h-12 bg-background border-border hover:bg-muted/50"
                >
                  {filterTags.length > 0
                    ? `${filterTags.length} tag(s) selected`
                    : "Select tags..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[220px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search tags..." className="text-xs" />
                  <CommandList>
                    <CommandEmpty>No tag found.</CommandEmpty>
                    <CommandGroup>
                      {tags.map((tag) => {
                        const isActive = filterTags.includes(tag.name);
                        return (
                          <CommandItem
                            key={tag.id}
                            value={tag.name}
                            onSelect={() => {
                              if (isActive) {
                                setFilterTags(filterTags.filter((t) => t !== tag.name));
                              } else {
                                setFilterTags([...filterTags, tag.name]);
                              }
                            }}
                            className="text-xs cursor-pointer"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                isActive ? "opacity-100" : "opacity-0"
                              )}
                            />
                            #{tag.name}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Selected Tags Display */}
            {filterTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 ml-1">
                {filterTags.map((tag) => {
                  const remove = () => setFilterTags(filterTags.filter(t => t !== tag));
                  return (
                    <Badge
                      key={tag}
                      variant="secondary"
                      role="button"
                      tabIndex={0}
                      aria-label={`Remove tag ${tag}`}
                      className="cursor-pointer text-[11px] font-normal px-2.5 py-0.5 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-colors focus-visible:ring-2 focus-visible:ring-destructive focus-visible:outline-none"
                      onClick={remove}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          remove();
                        }
                      }}
                    >
                      #{tag}
                      <X className="h-3 w-3 ml-1 opacity-50" aria-hidden="true" />
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="shrink-0 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3 w-3" /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ตารางแสดงรายการ prompts (Desktop) */}
      <div data-slot="card" className="mt-8 rounded-2xl border bg-card overflow-hidden shadow-sm hidden md:block transition-all duration-500 hover:shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-base font-medium">
            <thead>
              <tr className="border-b bg-muted/20">
                <th className="w-[32%] pl-4 sm:pl-6 xl:pl-8 pr-4 py-3 xl:py-4 text-left font-bold text-muted-foreground uppercase tracking-wider text-xs">Title</th>
                <th className="w-[12%] px-3 xl:px-4 py-3 xl:py-4 text-left font-bold text-muted-foreground uppercase tracking-wider text-xs">Category</th>
                <th className="w-[18%] px-3 xl:px-4 py-3 xl:py-4 text-left font-bold text-muted-foreground uppercase tracking-wider text-xs">Tags</th>
                <th className="w-[15%] px-3 xl:px-4 py-3 xl:py-4 text-left font-bold text-muted-foreground uppercase tracking-wider text-xs">Model</th>
                <th className="w-[10%] px-3 xl:px-4 py-3 xl:py-4 text-left font-bold text-muted-foreground uppercase tracking-wider text-xs">Status</th>
                <th className="w-[13%] pl-3 xl:pl-4 pr-4 sm:pr-6 xl:pr-8 py-3 xl:py-4 text-left font-bold text-muted-foreground uppercase tracking-wider text-xs whitespace-nowrap hidden lg:table-cell">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border" role={loading ? "status" : undefined} aria-busy={loading}>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 xl:px-5 py-5 xl:py-6"><Skeleton className="h-6 w-48" /></td>
                    <td className="px-3 xl:px-4 py-5 xl:py-6"><Skeleton className="h-6 w-24" /></td>
                    <td className="px-3 xl:px-4 py-5 xl:py-6"><Skeleton className="h-6 w-28" /></td>
                    <td className="px-3 xl:px-4 py-5 xl:py-6"><Skeleton className="h-6 w-24" /></td>
                    <td className="px-3 xl:px-4 py-5 xl:py-6"><Skeleton className="h-6 w-20" /></td>
                    <td className="px-3 xl:px-4 py-5 xl:py-6 hidden lg:table-cell"><Skeleton className="h-6 w-32" /></td>
                  </tr>
                ))
              ) : prompts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground border-dashed text-lg">
                    No prompts found matching your criteria
                  </td>
                </tr>
              ) : (
                prompts.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-all duration-300 group">
                    <td className="pl-4 sm:pl-6 xl:pl-8 pr-4 py-4 xl:py-5">
                      <Link href={`/prompts/${p.id}`} className="text-foreground hover:text-primary transition-colors block font-semibold text-base xl:text-lg">
                        {p.title}
                      </Link>
                      {p.description && (
                        <p className="text-xs xl:text-sm text-muted-foreground mt-1 line-clamp-1">{p.description}</p>
                      )}
                    </td>
                    <td className="px-3 xl:px-4 py-4 xl:py-5 text-muted-foreground text-sm xl:text-base">
                      {p.category ? p.category.name : "-"}
                    </td>
                    <td className="px-3 xl:px-4 py-4 xl:py-5">
                      <div className="flex flex-wrap gap-1.5">
                        {p.tags.length > 0 ? (
                          <>
                            {p.tags.slice(0, 4).map((t) => (
                              <span
                                key={t.id}
                                className="text-[10px] bg-muted border border-border px-2 py-0.5 rounded-full text-muted-foreground"
                              >
                                #{t.name}
                              </span>
                            ))}
                            {p.tags.length > 4 && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-[10px] text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-full cursor-default">
                                    +{p.tags.length - 4} more
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="flex flex-col gap-0.5">
                                  {p.tags.map((t) => (
                                    <span key={t.id}>#{t.name}</span>
                                  ))}
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 xl:px-4 py-4 xl:py-5">
                      <div className="flex flex-wrap gap-1">
                        {p.recommended_models && p.recommended_models.length > 0 ? (
                          <>
                            {p.recommended_models.slice(0, 2).map((model) => (
                              <Tooltip key={model}>
                                <TooltipTrigger asChild>
                                  <span className="bg-muted border border-border px-2 py-0.5 rounded-full text-muted-foreground text-[13px] whitespace-nowrap cursor-default">
                                    {model}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="flex flex-col gap-0.5">
                                  {p.recommended_models!.map((m) => (
                                    <span key={m}>{modelNameMap[m] ?? m}</span>
                                  ))}
                                </TooltipContent>
                              </Tooltip>
                            ))}
                            {p.recommended_models.length > 2 && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-[13px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full cursor-default">
                                    +{p.recommended_models.length - 2} more
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="flex flex-col gap-0.5">
                                  {p.recommended_models.map((m) => (
                                    <span key={m}>{modelNameMap[m] ?? m}</span>
                                  ))}
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 xl:px-4 py-4 xl:py-5">
                      {(() => {
                        const ds = displayStatusFor(p);
                        return (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] xl:text-xs font-bold px-2 py-0",
                              ds === 'DRAFT' && "bg-slate-500/10 text-slate-500 border-slate-500/20",
                              ds === 'REVIEW' && "bg-amber-500/10 text-amber-500 border-amber-500/20",
                              ds === 'PUBLISHED' && "bg-green-500/10 text-green-500 border-green-500/20",
                              ds === 'REJECTED' && "bg-red-500/10 text-red-500 border-red-500/20",
                              ds === 'ARCHIVED' && "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                            )}
                          >
                            {getStatusText(ds)}
                          </Badge>
                        );
                      })()}
                    </td>
                    <td className="pl-3 xl:pl-4 pr-4 sm:pr-6 xl:pr-8 py-4 xl:py-5 text-muted-foreground text-xs xl:text-sm whitespace-nowrap hidden lg:table-cell">
                      {new Date(p.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Card Layout (Mobile + Small tablet) */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-card border rounded-xl p-5 space-y-4" role="status" aria-busy="true">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          ))
        ) : prompts.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-xl text-lg">
            No prompts found
          </div>
        ) : (
          prompts.map((p) => (
            <Link 
              key={p.id} 
              href={`/prompts/${p.id}`}
              className="block bg-card border rounded-2xl p-5 transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg hover:border-primary/50 active:scale-95"
            >
              <div className="flex justify-between items-start mb-2.5">
                <h3 className="text-lg font-bold text-foreground line-clamp-1">{p.title}</h3>
                <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
                  <Badge variant="outline" className="text-[10px] h-5">
                    v{p.latest_version_no}
                  </Badge>
                  {(() => {
                    const ds = displayStatusFor(p);
                    return (
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] px-1.5 h-4 font-bold",
                          ds === 'DRAFT' && "bg-slate-500/10 text-slate-500 border-slate-500/20",
                          ds === 'REVIEW' && "bg-amber-500/10 text-amber-500 border-amber-500/20",
                          ds === 'PUBLISHED' && "bg-green-500/10 text-green-500 border-green-500/20",
                          ds === 'REJECTED' && "bg-red-500/10 text-red-500 border-red-500/20",
                          ds === 'ARCHIVED' && "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                        )}
                      >
                        {getStatusText(ds)}
                      </Badge>
                    );
                  })()}
                </div>
              </div>
              
              {p.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                  {p.description}
                </p>
              )}

              <div className="flex flex-wrap gap-3 items-center text-xs">
                {p.category && (
                  <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-md font-bold">
                    {p.category.name}
                  </span>
                )}
                {p.recommended_models && p.recommended_models.length > 0 && (
                  <span className="text-muted-foreground border-l pl-3">
                    {p.recommended_models.join(", ")}
                  </span>
                )}
                <span className="text-muted-foreground ml-auto font-medium">
                  {new Date(p.updated_at).toLocaleDateString("en-GB", { day: 'numeric', month: 'short' })}
                </span>
              </div>

              {p.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {p.tags.slice(0, 4).map((t) => (
                    <span key={t.id} className="text-[13px] text-muted-foreground bg-muted/40 px-2 py-0.5 rounded">
                      #{t.name}
                    </span>
                  ))}
                  {p.tags.length > 4 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-[13px] text-muted-foreground bg-muted/40 px-2 py-0.5 rounded cursor-default">
                          +{p.tags.length - 4} more
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="flex flex-col gap-0.5">
                        {p.tags.map((t) => (
                          <span key={t.id}>#{t.name}</span>
                        ))}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              )}
            </Link>
          ))
        )}
      </div>


      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs xl:text-sm text-muted-foreground text-center sm:text-left">
            Page {pagination.page} of {pagination.totalPages} <span className="opacity-70">({pagination.total} total)</span>
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="h-9 xl:h-10 px-4 xl:px-5 flex-1 sm:flex-none transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="h-9 xl:h-10 px-4 xl:px-5 flex-1 sm:flex-none transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
    </TooltipProvider>
  );
}
