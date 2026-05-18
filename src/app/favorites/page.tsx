"use client";

import { useEffect, useState, useMemo, useDeferredValue } from "react";
import Link from "next/link";
import axios from "axios";
import {
  Heart,
  Search,
  ExternalLink,
  Clock,
  Tag,
  Layers,
  BookOpen,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";
import { Badge } from "@/component/ui/badge";
import { Button } from "@/component/ui/button";
import { Input } from "@/component/ui/input";
import { Skeleton } from "@/component/ui/skeleton";
import { useFavorites } from "@/hooks/useFavorite";
import { useSession } from "next-auth/react";

/* ─── Types ─────────────────────────────────────────────── */
type FavoritePrompt = {
  id: number;
  prompt_id: number;
  prompt: {
    id: number;
    title: string;
    description: string | null;
    status: string;
    owner_id: number;
    recommended_model: string | null;
    latest_version_no: number;
    updated_at: string;
    category: { id: number; name: string } | null;
    tags: { id: number; name: string }[];
    versions: { id: number; promptVariables: { id: number }[] }[];
  };
};

/* ─── Helper Components ──────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    PUBLISHED: { label: "APPROVED", cls: "bg-green-500/10 text-green-500 border-green-500/20" },
    DRAFT:     { label: "DRAFT",    cls: "bg-slate-500/10 text-slate-500 border-slate-500/20" },
    REVIEW:    { label: "REVIEW",   cls: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
    REJECTED:  { label: "REJECTED", cls: "bg-red-500/10 text-red-500 border-red-500/20" },
    ARCHIVED:  { label: "ARCHIVED", cls: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" },
  };
  const s = map[status] ?? { label: status, cls: "bg-slate-100 text-slate-600 border-slate-200" };
  return (
    <span className={`inline-flex items-center px-1.5 h-4 rounded text-[10px] font-bold border ${s.cls}`}>
      {s.label}
    </span>
  );
}

function PromptCard({
  item,
  currentUserId,
  isAdminOrEditor,
  onUnfavorite,
}: {
  item: FavoritePrompt;
  currentUserId: number | null;
  isAdminOrEditor: boolean;
  onUnfavorite: (id: number) => void;
}) {
  const p = item.prompt;
  const totalVars = p?.versions?.reduce((sum, version) => sum + version.promptVariables.length , 0);
  // Owner sees every workflow state. Admin/Editor sees REVIEW/REJECTED on
  // others' prompts (they can act on those). Everyone else only ever sees
  // the PUBLISHED version on the detail page, so the badge says APPROVED.
  const isOwner = currentUserId === p.owner_id;
  const displayStatus = isOwner
    ? p.status
    : isAdminOrEditor && (p.status === "REVIEW" || p.status === "REJECTED")
      ? p.status
      : "PUBLISHED";

  return (
    <div
      data-slot="card"
      className="group relative flex flex-col rounded-xl px-6 py-5 border transition-all duration-300 ease-in-out bg-card h-full min-h-[160px] hover:!border-[#FF6B00] hover:!shadow-[0_0_15px_rgba(255,107,0,0.3)] hover:scale-[1.01] active:scale-95 cursor-pointer"
    >
      {/* Unfavorite button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          onUnfavorite(p.id);
        }}
        className="absolute top-4 right-4 p-1.5 rounded-lg text-primary opacity-0 group-hover:opacity-100 hover:bg-primary/10 transition-all duration-200 z-10"
        title="Remove from favorites"
        aria-label="Remove from favorites"
      >
        <Heart className="h-4 w-4 fill-primary" />
      </button>

      <Link href={`/prompts/${p.id}`} className="flex flex-col flex-1">
        <div className="flex items-start gap-3 pr-8">
          <div className="min-w-0 flex-1">
            <p className="text-[20px] font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors truncate mb-1">
              {p.title}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={displayStatus} />
              {p.category && (
                <span className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">
                  {p.category.name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tags */}
        {p.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {p.tags.slice(0, 4).map((t) => (
              <span
                key={t.id}
                className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground"
              >
                <Tag className="h-2.5 w-2.5" />
                {t.name}
              </span>
            ))}
            {p.tags.length > 4 && (
              <span className="text-xs text-muted-foreground px-2 py-0.5">
                +{p.tags.length - 4} more
              </span>
            )}
          </div>
        )}

        <div className="flex-1" />

        {/* Footer stats — matches collections/[id] */}
        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Layers className="h-3 w-3" />
              v{p.latest_version_no}
            </span>
            {totalVars > 0 && (
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {totalVars} var{totalVars > 1 ? "s" : ""}
              </span>
            )}
            {p.recommended_model && (
              <span className="hidden sm:block truncate max-w-[100px] opacity-60 text-[11px]">
                {p.recommended_model}
              </span>
            )}
          </div>
          <span className="flex items-center gap-1 shrink-0">
            <Clock className="h-3 w-3" />
            {new Date(p.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>
      </Link>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl px-6 py-5 space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <div className="flex gap-1.5 mt-1">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <div className="pt-3 border-t border-border flex justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */

const ITEMS_PER_PAGE = 9;

export default function FavoritesPage() {
  const { favoriteID, loading: favLoading, toggleFavorite } = useFavorites();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id ? Number(session.user.id) : null;
  const isAdminOrEditor =
    session?.user?.role === "ADMIN" || session?.user?.role === "EDITOR";
  const [favorites, setFavorites] = useState<FavoritePrompt[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [page, setPage] = useState(1);

  /* Fetch full favorites (with prompt details) */
  useEffect(() => {
    if (favLoading) return;
    axios
      .get<FavoritePrompt[]>("/api/favorites")
      .then((res) => setFavorites(res.data))
      .catch(() => setFavorites([]))
      .finally(() => setDataLoading(false));
  }, [favLoading, favoriteID]);

  const filtered = useMemo(() => {
    const q = deferredSearch.toLowerCase().trim();
    if (!q) return favorites;
    return favorites.filter(
      (f) =>
        (f.prompt.title || "").toLowerCase().includes(q) ||
        (f.prompt.description || "").toLowerCase().includes(q) ||
        (f.prompt.category?.name || "").toLowerCase().includes(q) ||
        (f.prompt.tags || []).some((t) => (t.name || "").toLowerCase().includes(q))
    );
  }, [favorites, deferredSearch]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, page, ITEMS_PER_PAGE]);

  const isLoading = favLoading || dataLoading;

  /* ── Render ── */
  return (
    <div className="pb-20 space-y-6 fade-in-up">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="h-8 w-8 xl:h-10 xl:w-10 rounded-[10px] bg-primary flex items-center justify-center">
              <Star className="h-4 w-4 xl:h-5 xl:w-5 text-white" />
            </div>
            <h1 className="text-2xl xl:text-3xl 2xl:text-4xl font-bold tracking-tight text-foreground">
              Favorites
            </h1>
          </div>
          <p className="text-sm xl:text-base text-muted-foreground">
            All prompts you&apos;ve marked as favorite
          </p>
        </div>

        {/* Count pill */}
        {!isLoading && favorites.length > 0 && (
          <div className="shrink-0 flex items-center gap-1.5 bg-primary/10 text-primary text-sm xl:text-base font-medium px-3.5 py-1.5 xl:px-4 xl:py-2 rounded-full">
            <Heart className="h-3.5 w-3.5 xl:h-4 xl:w-4 fill-primary" />
            {favorites.length} prompt{favorites.length > 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* ── Search bar ── */}
      {!isLoading && favorites.length > 0 && (
        <div className="relative mb-6 max-w-sm xl:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search favorites..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9 h-9 xl:h-10 text-sm bg-background"
          />
          {search && (
            <button
              onClick={() => { setSearch(""); setPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {/* ── Content ── */}
      {isLoading ? (
        /* Skeleton grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <h2 className="text-base font-semibold text-foreground mb-1">
            No favorites yet
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs mb-6">
            Click the Favorite button on any prompt and it will appear here.
          </p>
          <Button asChild size="sm" className="transition-all duration-300 ease-in-out hover:scale-105 active:scale-95">
            <Link href="/prompts" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Browse Prompts
            </Link>
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        /* No results after search */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="h-10 w-10 text-muted-foreground/40 mb-3" />
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
          {/* Card grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-fr">
            {paged.map((item) => (
              <PromptCard
                key={item.id}
                item={item}
                currentUserId={currentUserId}
                isAdminOrEditor={isAdminOrEditor}
                onUnfavorite={(id) => toggleFavorite(id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="transition-all duration-300 hover:scale-105 active:scale-95">
                  <ChevronLeft className="h-4 w-4" />Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="transition-all duration-300 hover:scale-105 active:scale-95">
                  Next<ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}