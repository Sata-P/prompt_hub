"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { Copy, Check, Clock, ChevronDown, Trash2, AlertCircle, CheckCircle2, XCircle, ShieldAlert } from "lucide-react";
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
  recommended_models: string[] | null;
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
    userRole?.toUpperCase() === "ADMIN" || 
    userRole?.toUpperCase() === "EDITOR" || 
    (prompt && userId && Number(userId) === prompt.owner.id);

  const canDelete = 
    userRole?.toUpperCase() === "ADMIN" || 
    userRole?.toUpperCase() === "EDITOR" || 
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
        
        // Requirement: Default to latest PUBLISHED version for general users
        const publishedVersions = res.data.versions.filter(v => v.status === "PUBLISHED");
        if (publishedVersions.length > 0) {
          // Sort descending by version_no
          const latestPublished = publishedVersions.sort((a, b) => b.version_no - a.version_no)[0];
          setSelectedVersionId(latestPublished.id);
        } else if (res.data.versions.length > 0) {
          setSelectedVersionId(res.data.versions[0].id);
        }
      })
      .catch(err => setError(err.response?.data?.error || "Failed to load prompt details"))
      .finally(() => setLoading(false));
  }, [id]);

  const selectedVersion = prompt?.versions.find(v => v.id === selectedVersionId) ?? prompt?.versions[0];

  // Requirement: Check for newer REVIEW version (Owner/Admin only)
  const latestPublishedNo = prompt?.versions
    .filter(v => v.status.toUpperCase() === "PUBLISHED")
    .reduce((max, v) => Math.max(max, v.version_no), 0) || 0;
    
  const hasPendingReview = prompt?.versions.some(v => v.status.toUpperCase() === "REVIEW" && v.version_no > latestPublishedNo);
  const isOwnerOrAdmin = userRole?.toUpperCase() === "ADMIN" || (prompt && userId && Number(userId) === prompt.owner.id);
  const isAdminOrEditor = userRole?.toUpperCase() === "ADMIN" || userRole?.toUpperCase() === "EDITOR";

  const handleReview = async (action: "APPROVE" | "REJECT") => {
    if (!selectedVersionId) return;
    if (!confirm(`Are you sure you want to ${action.toLowerCase()} this version?`)) return;

    try {
      await axios.post(`/api/prompts/${id}/versions/${selectedVersionId}/review`, { action });
      alert(`Version ${action === "APPROVE" ? "approved" : "rejected"} successfully.`);
      window.location.reload(); 
    } catch (err: any) {
      alert(err.response?.data?.error || `Failed to ${action.toLowerCase()} version.`);
    }
  };

  const handleSendForReview = async () => {
    if (!prompt) return;
    if (!confirm("Send this prompt for review?")) return;

    try {
      await axios.patch(`/api/prompts/${id}`, { status: "REVIEW" });
      
      // Also update the latest version status to REVIEW if it's DRAFT or REJECTED
      const latestVer = prompt.versions[0];
      if (latestVer && (latestVer.status === "DRAFT" || latestVer.status === "REJECTED")) {
        // We might need an API to update version status directly or just rely on the prompt status update
        // For now, the prompt status update is enough as it signals intent to admins.
      }
      
      alert("Prompt sent for review successfully!");
      window.location.reload();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to send for review.");
    }
  };

  const handleCancelReview = async () => {
    if (!prompt) return;
    if (!confirm("Are you sure you want to cancel the review for this prompt?")) return;

    try {
      await axios.patch(`/api/prompts/${id}`, { status: "DRAFT" });
      alert("Review cancelled successfully.");
      window.location.reload();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to cancel review.");
    }
  };

  const handleDeleteVersion = async (versionId: number, versionNo: number) => {
    if (!prompt) return;
    if (!confirm(`Are you sure you want to delete version v${versionNo}?`)) return;

    try {
      await axios.delete(`/api/prompts/${id}/versions/${versionId}`);
      alert("Version deleted successfully.");
      
      // If we deleted the currently selected version, reset to another one
      if (versionId === selectedVersionId) {
        // Find the next available version (excluding the one we just deleted)
        const remaining = prompt.versions.filter(v => v.id !== versionId);
        if (remaining.length > 0) {
          setSelectedVersionId(remaining[0].id);
        }
      }
      
      // Reload prompt data to refresh list
      const res = await axios.get<PromptDetail>(`/api/prompts/${id}`);
      setPrompt(res.data);
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to delete version.");
    }
  };

  const copyToClipboard = () => {
    if (!selectedVersion?.template_content) return;
    navigator.clipboard.writeText(selectedVersion.template_content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    switch (s) {
      case "PUBLISHED": return <Badge variant="success">Approved</Badge>;
      case "DRAFT":     return <Badge variant="secondary">Draft</Badge>;
      case "REVIEW":    return <Badge variant="warning">Review</Badge>;
      case "REJECTED":  return <Badge variant="destructive">Rejected</Badge>;
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
      {hasPendingReview && (isOwnerOrAdmin || isAdminOrEditor) && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between gap-3 text-yellow-800">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <span className="text-sm font-medium">A newer version is currently pending review.</span>
          </div>
                  <div className="flex items-center gap-2 mr-2">
                    {isAdminOrEditor && selectedVersion?.status.toUpperCase() === "REVIEW" && (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => handleReview("APPROVE")} 
                          className="bg-green-600 hover:bg-green-700 h-8 px-3 transition-all duration-300 hover:scale-105 active:scale-95"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => handleReview("REJECT")}
                          className="h-8 px-3 transition-all duration-300 hover:scale-105 active:scale-95"
                        >
                          <XCircle className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      </>
                    )}
                  </div>
                {(selectedVersion?.status.toUpperCase() === "DRAFT" || selectedVersion?.status.toUpperCase() === "REJECTED") && !isAdminOrEditor && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-yellow-300 bg-white hover:bg-yellow-50 text-yellow-700 h-8 transition-all duration-300 hover:scale-105 active:scale-95"
                    onClick={handleSendForReview}
                  >
                    Send for Review
                  </Button>
                )}
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-8">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">{prompt.title}</h1>
            {selectedVersion && getStatusBadge(selectedVersion.status)}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {prompt.description || "No description available"}
          </p>
          {prompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {prompt.tags.map(t => (
                <span key={t.id} className="text-[10px] sm:text-xs bg-muted px-2.5 py-1 rounded-full text-muted-foreground">
                  #{t.name}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0 w-full sm:w-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => toggleFavorite(prompt.id)}
            className="flex-1 sm:flex-none transition-all duration-300 ease-in-out hover:scale-105 active:scale-95"
            style={{ backgroundColor: isFavorite(prompt.id) ? 'orange' : '', color: isFavorite(prompt.id) ? 'white' : '' }}
          >
            {isFavorite(prompt.id) ? <FaHeart className="shrink-0" /> : <FaRegHeart className="shrink-0" />}
            <span className="ml-1 sm:inline hidden">
              {isFavorite(prompt.id) ? "Unfavorite" : "Favorite"}
            </span>
          </Button>
          
          <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 hover:bg-primary/5">
            <Link href={`/playground?promptId=${id}&versionId=${selectedVersionId || prompt.versions[0]?.id}`}>
              <span className="sm:inline hidden">Use Prompt</span>
              <span className="sm:hidden">Use</span>
            </Link>
          </Button>

          {(selectedVersion?.status.toUpperCase() === "DRAFT" || selectedVersion?.status.toUpperCase() === "REJECTED") && Number(userId) === prompt.owner.id && (
             <Button 
               size="sm" 
               variant="outline"
               onClick={handleSendForReview}
               className="flex-1 sm:flex-none border-primary/20 text-primary transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 hover:bg-primary/5"
             >
               <ShieldAlert className="mr-2 h-4 w-4" />
               Send for Review
             </Button>
          )}

          {selectedVersion?.status.toUpperCase() === "REVIEW" && Number(userId) === prompt.owner.id && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancelReview}
              className="flex-1 sm:flex-none border-yellow-400 text-yellow-700 transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 hover:bg-yellow-50"
            >
              Cancel Review
            </Button>
          )}

          {canEdit && (isAdminOrEditor || selectedVersion?.status.toUpperCase() !== "REVIEW") && (
            <Button size="sm" asChild className="flex-1 sm:flex-none transition-all duration-300 ease-in-out hover:scale-105 active:scale-95">
              <Link href={`/prompts/${id}/edit`}>Edit</Link>
            </Button>
          )}
          
          {canDelete && (
            <Button size="sm" variant="destructive" onClick={handleDelete} className="flex-1 sm:flex-none px-2 sm:px-3 transition-all duration-300 ease-in-out hover:scale-105 active:scale-95">
              <Trash2 className="h-4 w-4" />
              <span className="ml-1 sm:inline hidden">Delete</span>
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
                  className={`text-xs px-4 py-1.5 rounded-full border transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 ${
                    selectedVersionId === v.id
                      ? "bg-primary text-primary-foreground border-primary shadow-md"
                      : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground hover:shadow-sm"
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
          <Card className="border-border shadow-sm overflow-hidden transition-all duration-500 hover:shadow-md">
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
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground transition-all duration-300 ease-in-out hover:text-primary hover:scale-110 active:scale-95 hover:bg-primary/10 rounded-md flex items-center justify-center"
                  onClick={copyToClipboard}
                  title="Copy template"
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="bg-muted p-4 rounded-md border text-sm font-mono whitespace-pre-wrap text-foreground min-h-[120px]">
                {selectedVersion?.template_content || "No content"}
              </div>
            </CardContent>
          </Card>

          {/* Version History Timeline */}
          <Card className="border-border shadow-sm transition-all duration-500 hover:shadow-md">
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

                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedVersionId(v.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setSelectedVersionId(v.id);
                            }
                          }}
                          className={`w-full text-left py-3 px-3 rounded-md transition-all duration-300 ease-in-out group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                            isSelected ? "bg-primary/10 shadow-sm" : "hover:bg-muted/40 hover:-translate-y-0.5 hover:shadow-sm"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
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
                            </div>

                            {canEdit && prompt.versions.length > 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteVersion(v.id, v.version_no);
                                }}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                                title="Delete version"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>

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
                <div className="text-sm">{prompt.recommended_models?.length ? prompt.recommended_models.join(", ") : "gpt-4.1"}</div>
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
