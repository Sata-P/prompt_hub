"use client";

import { useEffect, useState, useMemo } from "react";
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
} from "lucide-react";
import { Badge } from "@/component/ui/badge";
import { Button } from "@/component/ui/button";
import { Input } from "@/component/ui/input";
import { Skeleton } from "@/component/ui/skeleton";
import { useFavorites } from "@/hooks/useFavorite";

/* ─── Types ─────────────────────────────────────────────── */
type FavoritePrompt = {
  id: number;
  prompt_id: number;
  prompt: {
    id: number;
    title: string;
    description: string | null;
    status: string;
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
  const map: Record<string, { label: string; variant: "success" | "warning" | "secondary" | "outline" | "default" }> = {
    PUBLISHED: { label: "Published", variant: "success" },
    DRAFT:     { label: "Draft",     variant: "secondary" },
    REVIEW:    { label: "Review",    variant: "warning" },
    ARCHIVED:  { label: "Archived",  variant: "outline" },
  };
  const s = map[status] ?? { label: status, variant: "default" };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

function PromptCard({
  item,
  onUnfavorite,
}: {
  item: FavoritePrompt;
  onUnfavorite: (id: number) => void;
}) {
  const p = item.prompt;
  const totalVars = p?.versions?.reduce((sum, version) => sum + version.promptVariables.length , 0);

  return (
    <div className="group relative bg-card border border-border rounded-xl p-5 hover:border-primary/40 hover:shadow-md transition-all duration-200">
      {/* Unfavorite button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          onUnfavorite(p.id);
        }}
        className="absolute top-4 right-4 p-1.5 rounded-lg text-primary opacity-0 group-hover:opacity-100 hover:bg-primary/10 transition-all duration-200"
        title="Remove from favorites"
        aria-label="Remove from favorites"
      >
        <Heart className="h-4 w-4 fill-primary" />
      </button>

      <Link href={`/prompts/${p.id}`} className="block">
        {/* Header */}
        <div className="flex items-start gap-3 pr-8">
          {/* Icon orb */}
          <div className="shrink-0 h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
            <BookOpen className="h-4 w-4 text-primary" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {p.title}
              </h3>
              <StatusBadge status={p.status} />
            </div>
            {p.category && (
              <p className="text-xs text-muted-foreground">{p.category.name}</p>
            )}
          </div>
        </div>

        {/* Description */}
        {p.description && (
          <p className="mt-3 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {p.description}
          </p>
        )}

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

        {/* Footer stats */}
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
              <span className="hidden sm:flex items-center gap-1 truncate max-w-[120px]">
                <span className="opacity-60">{p.recommended_model}</span>
              </span>
            )}
          </div>
          <span className="flex items-center gap-1 shrink-0">
            <Clock className="h-3 w-3" />
            {new Date(p.updated_at).toLocaleDateString("th-TH")}
          </span>
        </div>
      </Link>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-3">
      <div className="flex items-start gap-3">
        <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
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
/**
 * หน้าแสดงรายการ Prompts ที่ผู้ใช้กดถูกใจ (Favorites) ไว้
 * มีช่องค้นหาสำหรับกรอง Prompts ตามชื่อ รายละเอียด หมวดหมู่ หรือแท็ก
 */
export default function FavoritesPage() {
  const { favoriteID, loading: favLoading, toggleFavorite } = useFavorites();
  const [favorites, setFavorites] = useState<FavoritePrompt[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [search, setSearch] = useState("");

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
    const q = search.toLowerCase().trim();
    if (!q) return favorites;
    return favorites.filter(
      (f) =>
        f.prompt.title.toLowerCase().includes(q) ||
        f.prompt.description?.toLowerCase().includes(q) ||
        f.prompt.category?.name.toLowerCase().includes(q) ||
        f.prompt.tags.some((t) => t.name.toLowerCase().includes(q))
    );
  }, [favorites, search]);

  const isLoading = favLoading || dataLoading;

  /* ── Render ── */
  return (
    <div className="pb-20">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Heart className="h-4 w-4 text-primary fill-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Favorites
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            รายการ prompts ที่คุณกด favorite ไว้ทั้งหมด
          </p>
        </div>

        {/* Count pill */}
        {!isLoading && favorites.length > 0 && (
          <div className="shrink-0 flex items-center gap-1.5 bg-primary/10 text-primary text-sm font-medium px-3.5 py-1.5 rounded-full">
            <Heart className="h-3.5 w-3.5 fill-primary" />
            {favorites.length} prompt{favorites.length > 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* ── Search bar ── */}
      {!isLoading && favorites.length > 0 && (
        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="ค้นหา prompt..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9 h-9 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
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
            ยังไม่มี prompt ที่ถูก favorite
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs mb-6">
            กดปุ่ม Favorite บนหน้า prompt ที่คุณชื่นชอบ แล้วมันจะปรากฏที่นี่
          </p>
          <Button asChild size="sm">
            <Link href="/prompts" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              ไปยังหน้า Prompts
            </Link>
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        /* No results after search */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">
            ไม่พบผลลัพธ์สำหรับ &ldquo;{search}&rdquo;
          </p>
          <button
            onClick={() => setSearch("")}
            className="mt-2 text-xs text-primary hover:underline"
          >
            ล้างการค้นหา
          </button>
        </div>
      ) : (
        /* Card grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <PromptCard
              key={item.id}
              item={item}
              onUnfavorite={(id) => toggleFavorite(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}