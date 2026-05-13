"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { Plus, Search, X, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/component/ui/button";
import { Input } from "@/component/ui/input";
import { Badge } from "@/component/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/component/ui/select";
import { Skeleton } from "@/component/ui/skeleton";
import { PROVIDER_MODELS } from "@/lib/llm";

type Category = { id: number; name: string };
type Tag = { id: number; name: string };

type Prompt = {
  id: number;
  title: string;
  description: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | "REVIEW";
  latest_version_no: number;
  created_at: string;
  updated_at: string;
  category: { id: number; name: string } | null;
  tags: { id: number; name: string }[];
  recommended_model: string | null;
};

type ApiResponse = {
  data: Prompt[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

/**
 * หน้าแสดงรายการ Prompts ทั้งหมด
 * รองรับการกรองตามหมวดหมู่ (Category), สถานะ (Status), โมเดล (Model), แท็ก (Tag) และช่องค้นหา (Search)
 */
export default function PromptsList() {
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

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterModel, setFilterModel] = useState("all");
  const [filterTag, setFilterTag] = useState("all");

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
        
        if (searchQuery) searchParams.append("q", searchQuery);
        if (filterCategory !== "all") searchParams.append("categoryId", filterCategory);
        if (filterStatus !== "all") searchParams.append("status", filterStatus.toUpperCase());
        if (filterModel !== "all") searchParams.append("model", filterModel);
        if (filterTag !== "all") searchParams.append("tag", filterTag);

        const res = await fetch(`/api/prompts?${searchParams.toString()}`, {
          signal: controller.signal,
        });
        
        if (!res.ok) throw new Error("Failed to load prompts");
        
        const data = await res.json();
        
        setPrompts(data.data);
        setPagination(data.pagination);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("Failed to load prompts", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, [searchQuery, filterCategory, filterStatus, filterModel, filterTag, page]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, filterCategory, filterStatus, filterModel, filterTag]);

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
    filterTag !== "all" ||
    searchQuery !== "";

  const clearFilters = () => {
    setSearchQuery("");
    setFilterCategory("all");
    setFilterStatus("all");
    setFilterModel("all");
    setFilterTag("all");
  };

  return (
    <div className="pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center">
            <div className="rounded-lg bg-primary/10 flex items-center justify-center mr-2 h-8 w-8 shrink-0" >
            <FileText className="h-4 w-4 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground gap-2">
              Prompt Library
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Search, filter and manage prompts in the system</p>
        </div>
        <Link href="/prompts/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            New Prompt
          </Button>
        </Link>
      </div>

      {/* แถบตัวกรอง */}
      <div data-slot="card" className="mt-6 rounded-lg p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search prompts..."
              className="pl-9 h-10 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category */}
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="h-10 bg-background">
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
          {/* <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-10 bg-background">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">DRAFT</SelectItem>
              <SelectItem value="review">REVIEW</SelectItem>
              <SelectItem value="published">APPROVED</SelectItem>
              <SelectItem value="archived">ARCHIVED</SelectItem>
            </SelectContent>
          </Select> */}

          {/* Model */}
          <Select value={filterModel} onValueChange={setFilterModel}>
            <SelectTrigger className="h-10 bg-background">
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
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Tag:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterTag("all")}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  filterTag === "all"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                }`}
              >
                All
              </button>
              {tags.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setFilterTag(filterTag === t.name ? "all" : t.name)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    filterTag === t.name
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  #{t.name}
                </button>
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3 w-3" /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ตารางแสดงรายการ prompts (Desktop) */}
      <div data-slot="card" className="mt-6 rounded-lg overflow-hidden shadow-sm hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-base font-medium">
            <thead>
              <tr className="border-b bg-muted/20">
                <th className="w-[35%] px-5 py-5 text-left font-bold text-foreground capitalize text-lg">Title</th>
                <th className="w-[15%] px-5 py-5 text-left font-bold text-foreground capitalize text-lg">Category</th>
                <th className="w-[20%] px-5 py-5 text-left font-bold text-foreground capitalize text-lg">Tags</th>
                <th className="w-[15%] px-5 py-5 text-left font-bold text-foreground capitalize text-lg">Model</th>
                <th className="w-[15%] px-5 py-5 text-left font-bold text-foreground capitalize text-lg">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-5 py-6"><Skeleton className="h-6 w-48" /></td>
                    <td className="px-5 py-6"><Skeleton className="h-6 w-24" /></td>
                    <td className="px-5 py-6"><Skeleton className="h-6 w-28" /></td>
                    <td className="px-5 py-6"><Skeleton className="h-6 w-24" /></td>
                    <td className="px-5 py-6"><Skeleton className="h-6 w-32" /></td>
                  </tr>
                ))
              ) : prompts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground border-dashed text-lg">
                    No prompts found matching your criteria
                  </td>
                </tr>
              ) : (
                prompts.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-5 py-5">
                      <Link href={`/prompts/${p.id}`} className="text-foreground hover:text-primary transition-colors block font-bold text-lg">
                        {p.title}
                      </Link>
                      {p.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{p.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-5 text-muted-foreground text-base">
                      {p.category ? p.category.name : "-"}
                    </td>
                    <td className="px-5 py-5">
                      <div className="flex flex-wrap gap-1.5">
                        {p.tags.length > 0
                          ? p.tags.map((t) => (
                              <span
                                key={t.id}
                                className="text-xs bg-muted px-2.5 py-1 rounded-full text-muted-foreground"
                              >
                                #{t.name}
                              </span>
                            ))
                          : <span className="text-muted-foreground">-</span>}
                      </div>
                    </td>
                    <td className="px-5 py-5 text-muted-foreground text-base">
                      {p.recommended_model || "-"}
                    </td>
                    <td className="px-5 py-5 text-muted-foreground text-base">
                      {new Date(p.updated_at).toISOString().split("T")[0]}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Card Layout (Mobile) */}
      <div className="mt-6 space-y-4 md:hidden">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-card border rounded-xl p-5 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          ))
        ) : prompts.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground border border-dashed rounded-xl text-lg">
            No prompts found
          </div>
        ) : (
          prompts.map((p) => (
            <Link 
              key={p.id} 
              href={`/prompts/${p.id}`}
              className="block bg-card border rounded-xl p-5 hover:border-primary/50 transition-colors active:scale-[0.98]"
            >
              <div className="flex justify-between items-start mb-2.5">
                <h3 className="text-lg font-bold text-foreground line-clamp-1">{p.title}</h3>
                <Badge variant="outline" className="text-xs shrink-0 ml-2">
                  v{p.latest_version_no}
                </Badge>
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
                {p.recommended_model && (
                  <span className="text-muted-foreground border-l pl-3">
                    {p.recommended_model}
                  </span>
                )}
                <span className="text-muted-foreground ml-auto font-medium">
                  {new Date(p.updated_at).toLocaleDateString("en-GB", { day: 'numeric', month: 'short' })}
                </span>
              </div>

              {p.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {p.tags.slice(0, 3).map((t) => (
                    <span key={t.id} className="text-[11px] text-muted-foreground bg-muted/40 px-2 py-0.5 rounded">
                      #{t.name}
                    </span>
                  ))}
                  {p.tags.length > 3 && (
                    <span className="text-[11px] text-muted-foreground">+{p.tags.length - 3} more</span>
                  )}
                </div>
              )}
            </Link>
          ))
        )}
      </div>


      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} (Total {pagination.total} prompts)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="h-8"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="h-8"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
