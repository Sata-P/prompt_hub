"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { Copy, Check, Clock, ChevronDown, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";

import { Card, CardHeader, CardTitle, CardContent } from "@/component/ui/card";
import { Button } from "@/component/ui/button";
import { Badge } from "@/component/ui/badge";
import { Skeleton } from "@/component/ui/skeleton";
import { useFavorites } from "@/hooks/useFavorite";
import { FaHeart, FaRegHeart } from "react-icons/fa6";
import CommentSection from "@/component/comments/CommentSection";

type Version = {
  id: number;
  version_no: number;
  template_content: string;
  status: string;
  created_at: string;
  promptVariables: {
    id: number;
    name: string;
    type: string;
    description: string | null;
  }[];
};

type PromptDetail = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  latest_version_no: number;
  updated_at: string;
  category: { id: number; name: string } | null;
  owner: { id: number; name: string; email: string };
  tags: { id: number; name: string }[];
  versions: Version[];
  recommended_model: string | null;
};

/**
 * หน้าแสดงรายละเอียด Prompt
 * ดึงข้อมูล Prompt และ Versions ต่างๆ ตามรหัสที่ส่งมาในพารามิเตอร์ `params.id`
 */
export default function PromptDetailPage() {
  // ดึงพารามิเตอร์ id จาก URL
  const { id } = useParams();
  const router = useRouter();

  const { data: session } = useSession();
  const userId = session?.user?.id;
  const userRole = session?.user?.role;

  const {toggleFavorite, isFavorite} = useFavorites();
  const [prompt, setPrompt] = useState<PromptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);

  const canEdit = 
    userRole === "ADMIN" || 
    userRole === "EDITOR" || 
    (prompt && userId && Number(userId) === prompt.owner.id);



  const canDelete = 
    userRole === "ADMIN" || 
    userRole === "EDITOR" || 
    (prompt && userId && Number(userId) === prompt.owner.id);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this prompt? This action cannot be undone.")) return;
    try {
      await axios.delete(`/api/prompts/${id}`);
      router.push("/prompts");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to delete prompt.");
    }
  };



  useEffect(() => {
    if (!id) return;
    axios.get<PromptDetail>(`/api/prompts/${id}`)
      .then(res => {
        setPrompt(res.data);
        // default to latest version
        if (res.data.versions.length > 0) {
          setSelectedVersionId(res.data.versions[0].id);
        }
      })
      .catch(err => setError(err.response?.data?.error || "Failed to load prompt details"))
      .finally(() => setLoading(false));
  }, [id]);

  const selectedVersion = prompt?.versions.find(v => v.id === selectedVersionId) ?? prompt?.versions[0];

  const copyToClipboard = () => {
    if (!selectedVersion?.template_content) return;
    navigator.clipboard.writeText(selectedVersion.template_content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED": return <Badge variant="success">Approved</Badge>;
      case "DRAFT":     return <Badge variant="secondary">Draft</Badge>;
      case "REVIEW":    return <Badge variant="warning">Review</Badge>;
      case "ARCHIVED":  return <Badge variant="outline">Archived</Badge>;
      default:          return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl space-y-6 py-8">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !prompt) {
    return (
      <div className="py-20 text-center max-w-lg mx-auto">
        <div className="bg-destructive/10 text-destructive p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold mb-2">Prompt Not Found</h2>
          <p>{error}</p>
        </div>
        <Button asChild><Link href="/prompts">Back to Prompt Library</Link></Button>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold tracking-tight">{prompt.title}</h1>
            {/* {getStatusBadge(prompt.status)} */}
          </div>
          <p className="text-sm text-muted-foreground">
            {prompt.description || "No description available"}
          </p>
          {prompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {prompt.tags.map(t => (
                <span key={t.id} className="text-xs bg-muted px-2.5 py-1 rounded-full text-muted-foreground">
                  #{t.name}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-3 shrink-0">
          <Button variant="outline" size="sm" onClick={() => toggleFavorite(prompt.id)}
            style={{ backgroundColor: isFavorite(prompt.id) ? 'orange' : '', color: 'black' }}>
            {isFavorite(prompt.id) ? <FaHeart /> : <FaRegHeart />}
            {isFavorite(prompt.id) ? "Unfavorite" : "Favorite"}
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/playground?promptId=${id}&versionId=${selectedVersionId || prompt.versions[0]?.id}`}>Use Prompt</Link>
          </Button>

          {canEdit && (
            <Button size="sm" asChild>
              <Link href={`/prompts/${id}/edit`}>Edit</Link>
            </Button>
          )}
          {canDelete && (
            <Button size="sm" variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-1 h-4 w-4" /> Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ─── Left: Template + Version History ─── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Version Selector bar */}
          {prompt.versions.length > 1 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground font-medium">Version:</span>
              {prompt.versions.map(v => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVersionId(v.id)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    selectedVersionId === v.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  v{v.version_no}
                  {v.version_no === prompt.latest_version_no && (
                    <span className="ml-1 opacity-60">(latest)</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Template Card */}
          <Card className="border-border shadow-sm overflow-hidden">
            <CardHeader className="bg-background pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Template
                {selectedVersion && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    — v{selectedVersion.version_no}
                    {selectedVersion.version_no === prompt.latest_version_no ? " (latest)" : ""}
                  </span>
                )}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={copyToClipboard}
                title="Copy template"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="bg-muted p-4 rounded-md border text-sm font-mono whitespace-pre-wrap text-foreground min-h-[120px]">
                {selectedVersion?.template_content || "No content"}
              </div>
            </CardContent>
          </Card>

          {/* Version History Timeline */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Version History</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              {prompt.versions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No version available</p>
              ) : (
                <ol className="relative border-l border-border ml-3 space-y-0">
                  {prompt.versions.map((v, idx) => {
                    const isSelected = v.id === selectedVersionId;
                    const isLatest = v.version_no === prompt.latest_version_no;
                    return (
                      <li key={v.id} className="mb-0 ml-6">
                        {/* Timeline dot */}
                        <span
                          className={`absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${
                            isSelected
                              ? "bg-primary border-primary text-primary-foreground"
                              : "bg-background border-border text-muted-foreground"
                          }`}
                        >
                          <span className="text-[10px] font-bold">{v.version_no}</span>
                        </span>

                        <button
                          onClick={() => setSelectedVersionId(v.id)}
                          className={`w-full text-left py-3 px-3 rounded-md transition-colors group ${
                            isSelected ? "bg-primary/5" : "hover:bg-muted/40"
                          }`}
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-sm font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>
                              v{v.version_no}
                            </span>
                            {isLatest && (
                              <Badge variant="secondary" className="text-[10px] h-4 px-1.5">latest</Badge>
                            )}
                            {isSelected && (
                              <Badge variant="outline" className="text-[10px] h-4 px-1.5 text-primary border-primary/40">
                                viewing
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(v.created_at).toLocaleString("en-GB", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </div>
                          {v.promptVariables.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {v.promptVariables.length} variable{v.promptVariables.length > 1 ? "s" : ""}
                            </p>
                          )}
                        </button>

                        {idx < prompt.versions.length - 1 && <div className="h-2" />}
                      </li>
                    );
                  })}
                </ol>
              )}
            </CardContent>
          </Card>

        </div>

        {/* ─── Right: Metadata + Variables ─── */}
        <div className="space-y-6">

          <Card className="border-border shadow-sm">
            <CardHeader className="pt-4 pb-4 border-b">
              <CardTitle className="text-base font-semibold">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="grid grid-cols-[90px_1fr] items-baseline gap-1">
                <div className="text-sm font-semibold text-muted-foreground">Category</div>
                <div className="text-sm">{prompt.category ? prompt.category.name : "—"}</div>
              </div>
              
              {/* <div className="grid grid-cols-[90px_1fr] items-baseline gap-1">
                <div className="text-sm font-semibold text-muted-foreground">Status</div>
                <div>{getStatusBadge(prompt.status)}</div>
              </div> */}

              <div className="grid grid-cols-[90px_1fr] items-baseline gap-1">
                <div className="text-sm font-semibold text-muted-foreground">Model</div>
                <div className="text-sm">{prompt.recommended_model || "gpt-4.1"}</div>
              </div>
              <div className="grid grid-cols-[90px_1fr] items-baseline gap-1">
                <div className="text-sm font-semibold text-muted-foreground">Versions</div>
                <div className="text-sm">{prompt.versions.length}</div>
              </div>
              <div className="grid grid-cols-[90px_1fr] items-baseline gap-1">
                <div className="text-sm font-semibold text-muted-foreground">Updated</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(prompt.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </div>
              </div>
              {prompt.tags.length > 0 && (
                <div className="pt-1">
                  <div className="text-sm font-semibold text-muted-foreground mb-2">Tags</div>
                  <div className="flex flex-wrap gap-1.5">
                    {prompt.tags.map(t => (
                      <span key={t.id} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                        #{t.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="pt-4 pb-4 border-b">
              <CardTitle className="text-base font-semibold">
                Variables
                {selectedVersion && selectedVersion.promptVariables.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    (v{selectedVersion.version_no})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {!selectedVersion || selectedVersion.promptVariables.length === 0 ? (
                <p className="text-sm text-muted-foreground">No variables available</p>
              ) : (
                <ul className="space-y-3">
                  {selectedVersion.promptVariables.map(v => (
                    <li key={v.id} className="text-sm border rounded-md p-3 bg-muted/20">
                      <div className="font-mono font-semibold text-foreground">{`{{${v.name}}}`}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wide">{v.type}</div>
                      {v.description && (
                        <div className="text-xs text-muted-foreground mt-1">{v.description}</div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

        </div>
      </div>

      {/* ─── Comments Section ─── */}
      <div className="mt-8">
        <CommentSection promptId={prompt.id} />
      </div>
    </div>
  );
}
