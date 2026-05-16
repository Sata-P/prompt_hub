"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { Plus, Search, X, BookSearch } from "lucide-react";
import { Button } from "@/component/ui/button";
import { Input } from "@/component/ui/input";
import { Badge } from "@/component/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/component/ui/select";
import { Skeleton } from "@/component/ui/skeleton";

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
  const [loading, setLoading] = useState(true);

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
    }).catch(console.error);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const searchParams = new URLSearchParams();
      if (searchQuery) searchParams.append("q", searchQuery);
      if (filterCategory !== "all") searchParams.append("categoryId", filterCategory);
      if (filterStatus !== "all") searchParams.append("status", filterStatus.toUpperCase());
      if (filterModel !== "all") searchParams.append("model", filterModel);
      if (filterTag !== "all") searchParams.append("tag", filterTag);

      const promptsRes = await axios.get<ApiResponse>(`/api/prompts?${searchParams.toString()}`);
      setPrompts(promptsRes.data.data);
    } catch (err) {
      console.error("Failed to load prompts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center">
            <div className="rounded-lg bg-primary flex items-center justify-center mr-2 h-8 w-8">
              <BookSearch className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground gap-2">
              Prompt Library
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">ค้นหา จัดการ และเปิดใช้งาน prompt ในระบบ</p>
        </div>
        <Link href="/prompts/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Prompt
          </Button>
        </Link>
      </div>

      {/* แถบตัวกรอง */}
      <div className="mt-6 rounded-lg border bg-card p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
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
          <Select value={filterStatus} onValueChange={setFilterStatus}>
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
          </Select>

          {/* Model */}
          <Select value={filterModel} onValueChange={setFilterModel}>
            <SelectTrigger className="h-10 bg-background">
              <SelectValue placeholder="All Models" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Models</SelectItem>
              <SelectItem value="gpt-4.1">gpt-4.1</SelectItem>
              <SelectItem value="gpt-4.1-mini">gpt-4.1-mini</SelectItem>
              <SelectItem value="claude-3.5-sonnet">claude-3.5-sonnet</SelectItem>
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

      {/* ตารางแสดงรายการ prompts */}
      <div className="mt-6 rounded-lg border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-medium">
            <thead>
              <tr className="border-b bg-muted/20">
                <th className="px-5 py-4 text-left font-bold text-foreground capitalize">Title</th>
                <th className="px-5 py-4 text-left font-bold text-foreground capitalize">Category</th>
                <th className="px-5 py-4 text-left font-bold text-foreground capitalize">Tags</th>
                <th className="px-5 py-4 text-left font-bold text-foreground capitalize">Status</th>
                <th className="px-5 py-4 text-left font-bold text-foreground capitalize">Model</th>
                <th className="px-5 py-4 text-left font-bold text-foreground capitalize">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-5 py-5"><Skeleton className="h-5 w-48" /></td>
                    <td className="px-5 py-5"><Skeleton className="h-5 w-24" /></td>
                    <td className="px-5 py-5"><Skeleton className="h-5 w-28" /></td>
                    <td className="px-5 py-5"><Skeleton className="h-5 w-20" /></td>
                    <td className="px-5 py-5"><Skeleton className="h-5 w-24" /></td>
                    <td className="px-5 py-5"><Skeleton className="h-5 w-32" /></td>
                  </tr>
                ))
              ) : prompts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground border-dashed">
                    No prompts found matching your criteria
                  </td>
                </tr>
              ) : (
                prompts.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-5 py-4">
                      <Link href={`/prompts/${p.id}`} className="text-foreground hover:text-primary transition-colors block font-medium">
                        {p.title}
                      </Link>
                      {p.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{p.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground text-sm">
                      {p.category ? p.category.name : "-"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {p.tags.length > 0
                          ? p.tags.map((t) => (
                              <span
                                key={t.id}
                                className="text-[10px] bg-muted border border-border px-2 py-0.5 rounded-full text-muted-foreground"
                              >
                                #{t.name}
                              </span>
                            ))
                          : <span className="text-muted-foreground">-</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-block text-xs uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full ${
                        p.status === 'PUBLISHED' ? 'bg-green-500/15 text-green-400 border border-green-500/30' :
                        p.status === 'REVIEW' ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30' :
                        p.status === 'DRAFT' ? 'bg-muted text-muted-foreground border border-border' :
                        'bg-muted text-muted-foreground border border-border'
                      }`}>
                        {getStatusText(p.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground text-sm">
                      {p.recommended_model || "-"}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground text-sm">
                      {new Date(p.updated_at).toISOString().split("T")[0]}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
