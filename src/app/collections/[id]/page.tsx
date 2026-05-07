"use client";

import { useEffect, useState, useMemo, useTransition, useDeferredValue } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  FolderOpen,
  Globe,
  Lock,
  BookOpen,
  Clock,
  Play,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Layers,
  Trash2,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/component/ui/button";
import { Input } from "@/component/ui/input";
import { Skeleton } from "@/component/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/component/ui/dialog";
import axios from "axios";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────
type CollectionPrompt = {
  prompt_id: number;
  sort_order: number;
  prompt: {
    id: number;
    title: string;
    description: string | null;
    status: string;
    visibility: string;
    recommended_model: string | null;
    latest_version_no: number;
    updated_at: string;
    category?: { id: number; name: string } | null;
  };
};

type Collection = {
  id: number;
  name: string;
  description: string | null;
  visibility: string;
  created_at: string;
  updated_at: string;
  prompts: CollectionPrompt[];
};

// ─── Constants ───────────────────────────────────────────────
const ITEMS_PER_PAGE = 9;

// ─── Status Badge ────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    PUBLISHED: { label: "Published", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    APPROVED:  { label: "Approved",  cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    DRAFT:     { label: "Draft",     cls: "bg-slate-100 text-slate-600 border-slate-200" },
    REVIEW:    { label: "Review",    cls: "bg-amber-50 text-amber-700 border-amber-200" },
    ARCHIVED:  { label: "Archived",  cls: "bg-zinc-100 text-zinc-500 border-zinc-200" },
  };
  const s = map[status] ?? { label: status, cls: "bg-slate-100 text-slate-600 border-slate-200" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${s.cls}`}>
      {s.label}
    </span>
  );
}

// ─── Prompt Card ─────────────────────────────────────────────
function PromptCard({
  item,
  isAdmin,
  onRemove,
}: {
  item: CollectionPrompt;
  isAdmin: boolean;
  onRemove: (promptId: number) => void;
}) {
  const p = item.prompt;
  return (
    <div className="group relative flex flex-col bg-white border border-border rounded-xl p-5 hover:border-primary/40 hover:shadow-md transition-all duration-200">
      {/* Remove button (admin) */}
      {isAdmin && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onRemove(p.id);
          }}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          title="Remove from collection"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}

      <Link href={`/prompts/${p.id}`} className="flex flex-col flex-1">
        <div className="flex items-start gap-3">
          <div className="shrink-0 h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
            <BookOpen className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1 pr-5">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {p.title}
              </h3>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* <StatusBadge status={p.status} /> */}
              {p.category && (
                <span className="text-xs text-muted-foreground">{p.category.name}</span>
              )}
            </div>
          </div>
        </div>

        {p.description && (
          <p className="mt-3 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {p.description}
          </p>
        )}

        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Layers className="h-3 w-3" />
              v{p.latest_version_no}
            </span>
            {p.recommended_model && (
              <span className="hidden sm:block truncate max-w-[100px] opacity-60 text-[11px]">
                {p.recommended_model}
              </span>
            )}
          </div>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(p.updated_at).toLocaleDateString("en-GB", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </span>
        </div>
      </Link>

      {/* Run button */}
      <Link
        href={`/playground?promptId=${p.id}`}
        className="mt-3 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold transition-colors"
      >
        <Play className="h-3 w-3" /> Run in Playground
      </Link>
    </div>
  );
}

function PromptCardSkeleton() {
  return (
    <div className="bg-white border border-border rounded-xl p-5 space-y-3">
      <div className="flex items-start gap-3">
        <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <div className="pt-3 border-t border-border flex justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-7 w-full rounded-lg" />
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────
export default function CollectionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const collectionId = params?.id as string;
  const isAdmin =
    session?.user?.role === "ADMIN" || session?.user?.role === "EDITOR";

  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [page, setPage] = useState(1);

  // Add Prompt Dialog
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [availablePrompts, setAvailablePrompts] = useState<any[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(false);

  // ── Fetch collection ────────────────────────────────────
  useEffect(() => {
    if (!collectionId) return;
    setLoading(true);
    axios
      .get<Collection>(`/api/collections/${collectionId}`)
      .then((res) => setCollection(res.data))
      .catch((err) => {
        setError(err.response?.data?.error || "Failed to load collection");
      })
      .finally(() => setLoading(false));
  }, [collectionId]);

  // Reset page on search change
  useEffect(() => { setPage(1); }, [deferredSearch]);

  // ── Filter & paginate ───────────────────────────────────
  const filteredPrompts = useMemo(() => {
    if (!collection) return [];
    const q = deferredSearch.toLowerCase().trim();
    if (!q) return collection.prompts;
    return collection.prompts.filter((cp) =>
      (cp.prompt.title || "").toLowerCase().includes(q) ||
      (cp.prompt.description || "").toLowerCase().includes(q) ||
      (cp.prompt.category?.name || "").toLowerCase().includes(q)
    );
  }, [collection, deferredSearch]);

  const totalPages = Math.ceil(filteredPrompts.length / ITEMS_PER_PAGE);
  const pagedPrompts = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredPrompts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPrompts, page]);

  // ── Add prompt dialog ───────────────────────────────────
  const handleOpenAddPrompt = async () => {
    setIsAddOpen(true);
    setLoadingPrompts(true);
    try {
      const res = await axios.get("/api/prompts?limit=100");
      const existingIds = new Set(collection?.prompts.map((cp) => cp.prompt_id));
      setAvailablePrompts((res.data.data ?? res.data).filter((p: any) => !existingIds.has(p.id)));
    } catch {
      toast.error("Failed to load prompts");
    } finally {
      setLoadingPrompts(false);
    }
  };

  const handleAddPrompt = async (promptId: number) => {
    try {
      const res = await axios.post(`/api/collections/${collectionId}/prompts`, { prompt_id: promptId });
      setCollection((prev) => {
        if (!prev) return prev;
        return { ...prev, prompts: [...prev.prompts, { prompt_id: res.data.prompt_id, sort_order: res.data.sort_order, prompt: res.data.prompt }] };
      });
      setAvailablePrompts((prev) => prev.filter((p) => p.id !== promptId));
      toast.success("Successfully added to collection.");
    } catch {
      toast.error("Failed to add prompt");
    }
  };

  const handleRemovePrompt = async (promptId: number) => {
    if (!confirm("Remove this prompt from the collection?")) return;
    try {
      await axios.delete(`/api/collections/${collectionId}/prompts/${promptId}`);
      setCollection((prev) => {
        if (!prev) return prev;
        return { ...prev, prompts: prev.prompts.filter((cp) => cp.prompt_id !== promptId) };
      });
      toast.success("Prompt removed from collection.");
    } catch {
      toast.error("Failed to remove prompt");
    }
  };

  // ── Loading ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-40" />
        <div className="bg-white border border-border rounded-2xl p-6 space-y-3">
          <div className="flex gap-4">
            <Skeleton className="h-14 w-14 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-7 w-56" />
              <Skeleton className="h-4 w-80" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <PromptCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────
  if (error || !collection) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
          <FolderOpen className="h-7 w-7 text-destructive" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-1">
          {error?.includes("permission") ? "Access Denied" : "Collection Not Found"}
        </h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          {error || "This collection doesn't exist or has been removed."}
        </p>
        <Button variant="outline" onClick={() => router.push("/collections")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Collections
        </Button>
      </div>
    );
  }

  const promptCount = collection.prompts.length;

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/collections" className="hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" /> Collections
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate max-w-[200px]">{collection.name}</span>
      </nav>

      {/* ── Hero header ── */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Icon */}
          <div className="shrink-0 h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shadow-sm border border-primary/10">
            <FolderOpen className="h-7 w-7 text-primary" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                {collection.name}
              </h1>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  collection.visibility === "PUBLIC"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                {collection.visibility === "PUBLIC" ? (
                  <><Globe className="h-3 w-3" /> Public</>
                ) : (
                  <><Lock className="h-3 w-3" /> Private</>
                )}
              </span>
            </div>

            {collection.description ? (
              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                {collection.description}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground/50 italic">No description provided.</p>
            )}

            {/* Meta */}
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                <strong className="text-foreground">{promptCount}</strong>
                {promptCount === 1 ? " prompt" : " prompts"}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Updated{" "}
                {new Date(collection.updated_at).toLocaleDateString("en-GB", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Admin actions */}
          {isAdmin && (
            <div className="shrink-0">
              <Button size="sm" onClick={handleOpenAddPrompt} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Add Prompt
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── Prompts section ── */}
      <div className="space-y-4">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Prompts</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {filteredPrompts.length === promptCount
                ? `${promptCount} prompt${promptCount !== 1 ? "s" : ""}`
                : `${filteredPrompts.length} of ${promptCount} prompts`}
            </p>
          </div>

          {promptCount > 0 && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search prompts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-8 h-9 text-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Empty — no prompts at all */}
        {promptCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-dashed border-border rounded-2xl">
            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-3">
              <BookOpen className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">No prompts yet</h3>
            <p className="text-xs text-muted-foreground mb-4 max-w-xs">
              This collection is empty. Add prompts from the Prompt Library.
            </p>
            {isAdmin && (
              <Button size="sm" onClick={handleOpenAddPrompt}>
                <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Prompts
              </Button>
            )}
          </div>
        ) : filteredPrompts.length === 0 ? (
          /* Empty — search no match */
          <div className="flex flex-col items-center justify-center py-14 text-center bg-white border border-border rounded-2xl">
            <Search className="h-8 w-8 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              No prompts match &ldquo;{search}&rdquo;
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
            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {pagedPrompts.map((item) => (
                <PromptCard
                  key={item.prompt_id}
                  item={item}
                  isAdmin={isAdmin}
                  onRemove={handleRemovePrompt}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Add Prompt Dialog ── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Add Prompts to Collection</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 pt-2">
            {loadingPrompts ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
              </div>
            ) : availablePrompts.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-10 border border-dashed rounded-lg">
                No more prompts to add to this collection.
              </p>
            ) : (
              availablePrompts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/30 transition-colors"
                >
                  <div className="flex flex-col gap-0.5 pr-4 min-w-0">
                    <span className="font-semibold text-sm truncate">{p.title}</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {p.description || "No description"}
                    </span>
                  </div>
                  <Button size="sm" variant="secondary" className="shrink-0" onClick={() => handleAddPrompt(p.id)}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}