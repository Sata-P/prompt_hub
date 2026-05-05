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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 fade-in-up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back,{" "}
            <span className="font-medium text-foreground">
              {session?.user?.name?.split(" ")[0] || "there"}
            </span>
            . Here&apos;s what&apos;s happening.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/prompts">
              <FileText className="h-4 w-4" />
              View All
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/prompts/new">
              <Plus className="h-4 w-4" />
              New Prompt
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 fade-in-up stagger-1">
        <StatCard
          label="Total Prompts"
          icon={<FileText className="h-4 w-4" />}
          value={stats?.totalPrompts}
          loading={loading}
          accent="orange"
        />
        <StatCard
          label="Published"
          icon={<CheckCircle2 className="h-4 w-4" />}
          value={stats?.byStatus.PUBLISHED}
          loading={loading}
          accent="green"
        />
        <StatCard
          label="In Draft"
          icon={<AlertCircle className="h-4 w-4" />}
          value={stats?.byStatus.DRAFT}
          loading={loading}
          accent="yellow"
        />
        <StatCard
          label="Archived"
          icon={<Archive className="h-4 w-4" />}
          value={stats?.byStatus.ARCHIVED}
          loading={loading}
          accent="neutral"
        />
      </div>

      {/* ── Main content grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in-up stagger-2">
        {/* Recently updated prompts */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm border-border/60 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Recently Updated</CardTitle>
              </div>
              <Button variant="ghost" size="sm" asChild className="text-xs text-muted-foreground h-7 px-2">
                <Link href="/prompts">
                  View all <ArrowRight className="h-3 w-3 ml-1" />
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
                        className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-accent/60 hover:border-primary/20 border border-transparent transition-all duration-150 group"
                        style={{ animationDelay: `${i * 40}ms` }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-8 w-8 shrink-0 rounded-md bg-primary/10 flex items-center justify-center">
                            <FileText className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                              {prompt.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {prompt.category && (
                                <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                  {prompt.category.name}
                                </span>
                              )}
                              <span className="text-[11px] text-muted-foreground">
                                v{prompt.latest_version_no} ·{" "}
                                {new Date(prompt.updated_at).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge variant={cfg.variant} className="shrink-0 ml-2 text-[10px]">
                          {cfg.label}
                        </Badge>
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
          {/* Overview card */}
          <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Overview</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <OverviewRow
                icon={<Tag className="h-3.5 w-3.5" />}
                label="Categories"
                value={stats?.totalCategories}
                loading={loading}
                href="/settings"
              />
              <OverviewRow
                icon={<Star className="h-3.5 w-3.5" />}
                label="Tags"
                value={stats?.totalTags}
                loading={loading}
                href="/settings"
              />
              <OverviewRow
                icon={<AlertCircle className="h-3.5 w-3.5 text-yellow-500" />}
                label="In Review"
                value={stats?.byStatus.REVIEW}
                loading={loading}
                href="/prompts"
              />

              {session?.user?.role === "ADMIN" && (
                <div className="pt-1">
                  <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                    <Link href="/settings">Manage Categories & Tags</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <QuickAction
                href="/prompts/new"
                icon={<Plus className="h-4 w-4" />}
                label="New Prompt"
                description="Start from a blank template"
                primary
              />
              <QuickAction
                href="/playground"
                icon={<PlayCircle className="h-4 w-4" />}
                label="Open Playground"
                description="Test prompts with AI models"
              />
              <QuickAction
                href="/collections"
                icon={<FolderOpen className="h-4 w-4" />}
                label="Browse Collections"
                description="Grouped prompt libraries"
              />
            </CardContent>
          </Card>
        </div>
      </div>
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
    orange:  "bg-orange-50 text-primary border-orange-100",
    green:   "bg-green-50  text-green-600  border-green-100",
    yellow:  "bg-yellow-50 text-yellow-600 border-yellow-100",
    neutral: "bg-muted     text-muted-foreground border-border",
  };
  const valueClasses = {
    orange:  "text-primary",
    green:   "text-green-600",
    yellow:  "text-yellow-600",
    neutral: "text-foreground",
  };

  return (
    <Card className="shadow-sm border-border/60 hover:border-primary/30 hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
            {loading ? (
              <Skeleton className="h-7 w-14 mt-1" />
            ) : (
              <p className={`text-2xl font-bold ${valueClasses[accent]}`}>{value ?? 0}</p>
            )}
          </div>
          <div className={`p-2 rounded-lg border ${accentClasses[accent]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OverviewRow({
  icon,
  label,
  value,
  loading,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value?: number;
  loading: boolean;
  href?: string;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        {icon}
        <span>{label}</span>
      </div>
      {loading ? (
        <Skeleton className="h-4 w-8" />
      ) : (
        <Link href={href ?? "#"} className="text-sm font-bold text-foreground hover:text-primary transition-colors">
          {value ?? 0}
        </Link>
      )}
    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
  description,
  primary,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "flex items-center gap-3 p-3 rounded-lg border transition-all duration-150 group",
        primary
          ? "border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50"
          : "border-border/60 hover:border-primary/20 hover:bg-accent/60",
      ].join(" ")}
    >
      <div
        className={[
          "h-8 w-8 shrink-0 rounded-md flex items-center justify-center transition-colors",
          primary
            ? "bg-primary text-white"
            : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
        ].join(" ")}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className={`text-sm font-medium ${primary ? "text-primary" : "text-foreground"}`}>
          {label}
        </p>
        <p className="text-[11px] text-muted-foreground truncate">{description}</p>
      </div>
      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground ml-auto shrink-0 group-hover:text-primary transition-colors" />
    </Link>
  );
}
