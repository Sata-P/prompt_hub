"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Archive,
  PlayCircle,
  FolderOpen,
  Tag,
  TrendingUp,
  Star,
  ArrowRight,
  ChevronDown,
  X,
  ExternalLink,
  House,
} from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/component/ui/card";
import { Button } from "@/component/ui/button";
import { Skeleton } from "@/component/ui/skeleton";
import { Badge } from "@/component/ui/badge";
import { useSession } from "next-auth/react";

type DashboardStats = {
  totalPrompts: number;
  byStatus: {
    DRAFT: number;
    REVIEW: number;
    PUBLISHED: number;
    REJECTED: number;
    ARCHIVED: number;
  };
  recentPrompts: {
    id: number;
    title: string;
    status: string;
    latest_version_no: number;
    updated_at: string;
    category?: { name: string; color?: string } | null;
  }[];
  totalCategories: number;
  totalTags: number;
  totalFavorites: number;
  systemTotalPrompts: number;
  popularCategories: { id: number; name: string; color?: string | null; _count: { prompts: number }; prompts: { id: number; title: string; status: string }[] }[];
  popularTags: { id: number; name: string; _count: { prompts: number }; prompts: { prompt: { id: number; title: string; status: string } }[] }[];
};

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "success" | "warning" | "secondary" | "outline" | "default" }
> = {
  PUBLISHED: { label: "Published", variant: "success" },
  DRAFT:     { label: "Draft",     variant: "secondary" },
  REVIEW:    { label: "Review",    variant: "warning" },
  ARCHIVED:  { label: "Archived",  variant: "outline" },
  REJECTED:  { label: "Rejected",  variant: "default" },
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const [viewingCategoryPrompts, setViewingCategoryPrompts] = useState<NonNullable<DashboardStats["popularCategories"]>[number] | null>(null);

  useEffect(() => {
    axios
      .get<DashboardStats>("/api/dashboard/stats")
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Failed to load dashboard stats", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-full">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="rounded-lg bg-primary/10 flex items-center justify-center mr-2 h-8 w-8 shrink-0">
            <House className="h-4 w-4 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8 fade-in-up stagger-1">
        <StatCard
          label="My Prompts"
          icon={<FileText className="h-5 w-5" />}
          value={stats?.totalPrompts}
          loading={loading}
          accent="orange"
        />
        <StatCard
          label="Total Prompts"
          icon={<CheckCircle2 className="h-5 w-5" />}
          value={stats?.systemTotalPrompts}
          loading={loading}
          accent="green"
        />
        <StatCard
          label="Favorite Prompts"
          icon={<Star className="h-5 w-5" />}
          value={stats?.totalFavorites}
          loading={loading}
          accent="yellow"
        />
      </div>

      {/* ── Main content grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in-up stagger-2">
        {/* Recently updated prompts */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm border-border/60 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl font-bold">Recently Updated</CardTitle>
              </div>
              <Button variant="ghost" size="sm" asChild className="text-xs text-orange-500 h-7 px-2 hover:text-orange-600 hover:bg-orange-500/10">
                <Link href="/prompts">
                  <span className="hidden sm:inline">View all</span>
                  <span className="sm:hidden">All</span>
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-lg" />
                  ))}
                </div>
              ) : !stats?.recentPrompts?.length ? (
                <div className="py-10 text-center rounded-lg border border-dashed border-border">
                  <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No prompts yet</p>
                  <Button size="sm" className="mt-3" asChild>
                    <Link href="/prompts/new">Create your first prompt</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  {stats.recentPrompts.map((prompt, i) => {
                    const cfg = STATUS_CONFIG[prompt.status] ?? STATUS_CONFIG.DRAFT;
                    return (
                      <Link
                        key={prompt.id}
                        href={`/prompts/${prompt.id}`}
                        className="flex items-center justify-between px-2 sm:px-3 py-3 rounded-lg hover:bg-accent/60 hover:border-primary/20 border border-transparent transition-all duration-150 group"
                        style={{ animationDelay: `${i * 40}ms` }}
                      >
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <div className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-lg bg-orange-500/15 flex items-center justify-center text-orange-500">
                            <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-base sm:text-lg font-bold text-foreground truncate group-hover:text-primary transition-colors">
                              {prompt.title}
                            </p>
                            <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                              {prompt.category && (
                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-muted-foreground bg-muted px-2 py-0.5 rounded truncate max-w-[100px]">
                                  {prompt.category.name}
                                </span>
                              )}
                              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                                v{prompt.latest_version_no} ·{" "}
                                {new Date(prompt.updated_at).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: stats + quick actions */}
        <div className="flex flex-col gap-4">
          {/* Popular Tags card */}
          <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl font-bold">Tags</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3 pb-4">
              {loading ? (
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-14" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {stats?.popularTags?.map((tag) => (
                    <Badge key={tag.id} variant="outline" className="flex items-center gap-1 hover:bg-accent/50 cursor-default bg-card">
                      <Tag className="h-3 w-3 text-muted-foreground mr-0.5" />
                      <span className="text-xs font-medium">{tag.name}</span>
                      <span className="text-[10px] text-muted-foreground ml-1">({tag._count.prompts})</span>
                    </Badge>
                  ))}
                  {stats?.popularTags?.length === 0 && (
                     <p className="text-xs text-muted-foreground text-center py-2 w-full">No tags found</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Popular Categories */}
          <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl font-bold">Categories</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {stats?.popularCategories?.map((cat) => (
                    <div 
                      key={cat.id} 
                      className="flex items-center justify-between p-2 hover:bg-accent/50 transition-colors w-full text-left rounded-lg border border-border/60 bg-card cursor-pointer"
                      onClick={() => setViewingCategoryPrompts(cat)}
                    >
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium">{cat.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        {cat.prompts.length} prompts
                      </Badge>
                    </div>
                  ))}
                  {stats?.popularCategories?.length === 0 && (
                     <p className="text-xs text-muted-foreground text-center py-2">No categories found</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pop up showing prompts for a category */}
      {viewingCategoryPrompts && (
        <div className="fixed inset-0 bg-black/50 z-50">
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card p-6 rounded-lg max-w-md w-full border shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-foreground">
                Prompts in &ldquo;{viewingCategoryPrompts.name}&rdquo;
              </h3>
              <Button size="icon" variant="ghost" onClick={() => setViewingCategoryPrompts(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {viewingCategoryPrompts.prompts && viewingCategoryPrompts.prompts.length > 0 ? (
              <ul className="space-y-2 max-h-60 overflow-y-auto">
                {viewingCategoryPrompts.prompts.map(p => (
                  <li key={p.id} className="text-sm border-b border-border pb-1.5 last:border-0 last:pb-0">
                    <Link 
                      href={`/prompts/${p.id}`} 
                      className="text-muted-foreground hover:text-primary transition-colors flex items-center justify-between"
                      onClick={() => setViewingCategoryPrompts(null)}
                    >
                      <span className="truncate">{p.title}</span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 ml-2 opacity-50" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No prompts linked to this category.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ── */

function StatCard({
  label,
  icon,
  value,
  loading,
  accent,
}: {
  label: string;
  icon: React.ReactNode;
  value?: number;
  loading: boolean;
  accent: "orange" | "green" | "yellow" | "neutral";
}) {
  const accentClasses = {
    orange:  "bg-orange-500/15 text-orange-400",
    green:   "bg-emerald-500/15 text-emerald-400",
    yellow:  "bg-yellow-500/15 text-yellow-400",
    neutral: "bg-white/8 text-muted-foreground",
  };

  return (
    <Card className="shadow-sm border-border/60 hover:border-primary/30 hover:shadow-md transition-all duration-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm sm:text-base font-bold text-muted-foreground mb-1.5">{label}</p>
            {loading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <p className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">{value ?? 0}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${accentClasses[accent]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


