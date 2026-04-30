"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Folder, ArrowLeft, Clock, LayoutGrid, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { Button } from "@/component/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/component/ui/card";
import { Badge } from "@/component/ui/badge";
import { Skeleton } from "@/component/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/component/ui/dialog";
import axios from "axios";

type CollectionPrompt = {
  prompt_id: number;
  sort_order: number;
  prompt: {
    id: number;
    title: string;
    description: string | null;
    status: string;
    latest_version_no: number;
    updated_at: string;
    category?: { name: string; color?: string } | null;
  };
};

type Collection = {
  id: number;
  name: string;
  description: string | null;
  visibility: string;
  prompts: CollectionPrompt[];
};

/**
 * หน้าแสดงรายละเอียดของ Collection
 * ดึงข้อมูล Collection (และ Prompts ภายใน) โดยอ้างอิงจาก `params.id`
 */
export default function CollectionDetailsPage() {
  // ดึงค่า params (ตัวแปรที่รับมาจาก URL Path)
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);

  // Add Prompt Dialog State
  const [isAddPromptOpen, setIsAddPromptOpen] = useState(false);
  const [availablePrompts, setAvailablePrompts] = useState<any[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(false);

  // Effect สำหรับโหลดข้อมูล Collection เมื่อ Component ถูก Mount หรือ params.id เปลี่ยนแปลง
  useEffect(() => {
    if (!params.id) return; // หากไม่มี id ใน URL ก็ไม่ต้องโหลด
    
    const fetchCollection = async () => {
      try {
        const res = await axios.get<Collection>(`/api/collections/${params.id}`);
        setCollection(res.data);
      } catch (err) {
        console.error("Failed to load collection details:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCollection();
  }, [params.id]);

  const handleOpenAddPrompt = async () => {
    setIsAddPromptOpen(true);
    setLoadingPrompts(true);
    try {
      const res = await axios.get("/api/prompts?limit=50");
      const existingIds = new Set(collection?.prompts.map(cp => cp.prompt_id));
      setAvailablePrompts(res.data.data.filter((p: any) => !existingIds.has(p.id)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPrompts(false);
    }
  };

  const handleRemovePromptFromCollection = async (e: React.MouseEvent, promptId: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to remove this prompt from the collection?")) return;
    
    try {
      await axios.delete(`/api/collections/${params.id}/prompts/${promptId}`);
      setCollection(prev => {
        if (!prev) return prev;
        return {
           ...prev,
           prompts: prev.prompts.filter(p => p.prompt_id !== promptId)
        };
      });
    } catch (err) {
      console.error("Failed to remove prompt:", err);
      alert("Failed to remove prompt from collection");
    }
  };

  const handleAddPromptToCollection = async (promptId: number) => {
    try {
      const res = await axios.post(`/api/collections/${params.id}/prompts`, { prompt_id: promptId });
      setCollection(prev => {
        if (!prev) return prev;
        return {
           ...prev,
           prompts: [...prev.prompts, {
              prompt_id: res.data.prompt_id,
              sort_order: res.data.sort_order,
              prompt: res.data.prompt
           }]
        };
      });
      setAvailablePrompts(prev => prev.filter(p => p.id !== promptId));
    } catch (err) {
      console.error("Failed to add prompt:", err);
      alert("Failed to add prompt to collection");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED": return <Badge variant="default" className="bg-green-500/10 text-green-500 hover:bg-green-500/20 shadow-none border-none">Published</Badge>;
      case "DRAFT": return <Badge variant="secondary" className="shadow-none border-none">Draft</Badge>;
      case "REVIEW": return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 shadow-none border-none">Review</Badge>;
      case "ARCHIVED": return <Badge variant="outline" className="shadow-none">Archived</Badge>;
      default: return <Badge variant="outline" className="shadow-none">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="py-8 space-y-6 max-w-5xl mx-auto px-4 md:px-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="py-24 text-center">
        <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h2 className="text-xl font-bold mb-2">Collection Not Found</h2>
        <p className="text-muted-foreground mb-6">The collection you're looking for doesn't exist or you don't have access.</p>
        <Button onClick={() => router.push('/collections')}>
          Back to Collections
        </Button>
      </div>
    );
  }

  return (
    <div className="py-4 pb-20 fade-in-up">
      {/* Header section */}
      <div className="mb-8 space-y-4">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/collections')} 
          className="pl-0 text-muted-foreground hover:text-foreground mb-2 flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> 
          Back to Collections
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                <Folder className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {collection.name}
                  </h1>
                  {collection.visibility === 'PUBLIC' ? (
                    <Badge variant="secondary" className="flex items-center gap-1 bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-200/20">
                      <Eye className="w-3 h-3" /> Public
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <EyeOff className="w-3 h-3" /> Private
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mt-1 max-w-2xl text-lg">
                  {collection.description || 'No description provided.'}
                </p>
              </div>
            </div>
          </div>
          {session?.user?.role === "ADMIN" && (
            <div className="flex gap-2">
              <Button onClick={handleOpenAddPrompt} className="hidden md:flex">
                <LayoutGrid className="mr-2 h-4 w-4" /> Add Prompt
              </Button>
            </div>
          )}
        </div>
        
      </div>

      {/* Prompts section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Prompts in this Collection <span className="text-muted-foreground text-base font-normal ml-2">({collection.prompts.length})</span>
          </h2>
          {session?.user?.role === "ADMIN" && (
            <Button onClick={handleOpenAddPrompt} variant="outline" className="md:hidden">
              Add Prompt
            </Button>
          )}
        </div>

        {collection.prompts.length === 0 ? (
          <Card className="border-dashed shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
               <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                 <Folder className="h-8 w-8 text-muted-foreground/40" />
               </div>
               <h3 className="text-lg font-semibold text-foreground mb-2">
                 ยังไม่มี Prompt ใน Collection นี้
               </h3>
               <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                 คุณยังไม่ได้เพิ่ม Prompt ใดๆ ลงใน Collection นี้ เพิ่ม Prompt เพื่อให้ง่ายต่อการเรียกใช้งาน
               </p>
               {session?.user?.role === "ADMIN" && (
                 <Button onClick={handleOpenAddPrompt}>
                   ค้นหาและเพิ่ม Prompt
                 </Button>
               )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {collection.prompts.map((cp) => (
              <Link key={cp.prompt_id} href={`/prompts/${cp.prompt_id}`}>
                <Card className="h-full hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer group bg-gradient-to-br from-card to-card hover:from-card hover:to-primary/5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                        {cp.prompt.title}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(cp.prompt.status)}
                        {session?.user?.role === "ADMIN" && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => handleRemovePromptFromCollection(e, cp.prompt_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {cp.prompt.category && (
                      <Badge variant="outline" className="text-[10px] uppercase w-fit tracking-wider">
                        {cp.prompt.category.name}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {cp.prompt.description || 'No description provided.'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/50">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>v{cp.prompt.latest_version_no}</span>
                      </div>
                      <span>Updated {new Date(cp.prompt.updated_at).toLocaleDateString('th-TH')}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Add Prompt Dialog */}
      <Dialog open={isAddPromptOpen} onOpenChange={setIsAddPromptOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Add Prompts to Collection</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {loadingPrompts ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full object-cover" />)}
              </div>
            ) : availablePrompts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 border border-dashed rounded-lg"> ไม่มี Prompts เหลือให้เพิ่มเข้า Collection นี้</p>
            ) : (
              availablePrompts.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/30 transition-colors">
                  <div className="flex flex-col gap-1 pr-4">
                    <span className="font-semibold text-sm line-clamp-1">{p.title}</span>
                    <span className="text-xs text-muted-foreground line-clamp-1">{p.description || "ไม่มีรายละเอียด"}</span>
                  </div>
                  <Button size="sm" variant="secondary" className="shrink-0" onClick={() => handleAddPromptToCollection(p.id)}>
                    <Plus className="w-4 h-4 mr-1" /> Add
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