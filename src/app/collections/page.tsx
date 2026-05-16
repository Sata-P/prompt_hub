"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Folder, FolderOpen, Plus, MoreVertical, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/component/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/component/ui/card";
import { Skeleton } from "@/component/ui/skeleton";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Badge } from "@/component/ui/badge"; 
import { toast } from "sonner";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/component/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/component/ui/dropdown-menu";
import { Input } from "@/component/ui/input";
import { Textarea } from "@/component/ui/textarea";
import { Switch } from "@/component/ui/switch";
import { Label } from "@/component/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/component/ui/alert-dialog";

type Collection = {
  prompts?: any[];
  id: number;
  name: string;
  description: string;
  visibility: string;
  _count?: {
    prompts: number;
  };
};

function CardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl px-6 py-5 space-y-3 h-full min-h-[160px]">
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <div className="flex-1" />
      <div className="pt-3 border-t border-border flex justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

// Since the CollectionCard is wrapped in a Link, putting buttons inside it directly can cause navigation issues.
// To avoid messy event bubbling issues, we place the DropdownMenu outside the Link but position it over it, or we handle propagation.
function CollectionCard({ 
  collection, 
  isAdmin, 
  onEdit, 
  onDelete 
}: { 
  collection: Collection, 
  isAdmin: boolean, 
  onEdit: (c: Collection) => void, 
  onDelete: (c: Collection) => void 
}) {
  return (
    <div className="group relative flex flex-col rounded-xl px-6 py-5 border bg-card transition-all duration-300 ease-in-out hover:!border-[#FF6B00] hover:!shadow-[0_0_15px_rgba(255,107,0,0.3)] hover:scale-[1.01] active:scale-95 cursor-pointer min-h-[160px]">
      <Link href={`/collections/${collection.id}`} className="absolute inset-0 z-0" />
      
      <div className="flex-1 flex flex-col relative z-10 pointer-events-none">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[20px] text-base font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors truncate mb-1">
              {collection.name}
            </p>
            
            <div className="flex items-center gap-2 flex-wrap">
              {collection.visibility === 'PUBLIC' ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                  Public
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-slate-500/10 text-slate-400 border-slate-500/20">
                  Private
                </span>
              )}
            </div>
          </div>

          {isAdmin && (
            <div className="pointer-events-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 bg-background/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                  <DropdownMenuItem onClick={() => onEdit(collection)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  {collection._count?.prompts === 0 && (
                    <DropdownMenuItem onClick={() => onDelete(collection)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>

      {/* Footer stats */}
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground relative z-10 pointer-events-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <Folder className="h-3.5 w-3.5" />
            <strong className="text-foreground">{collection._count?.prompts || 0}</strong>
            {collection._count?.prompts === 1 ? " prompt" : " prompts"}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * หน้าแสดงรายการ Collections ทั้งหมด
 * สำหรับผู้ดูแลระบบสามารถสร้าง แก้ไข หรือลบ Collection ได้
 */
const ITEMS_PER_PAGE = 9;

export default function CollectionsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "EDITOR";

  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(collections.length / ITEMS_PER_PAGE);
  const pagedCollections = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return collections.slice(start, start + ITEMS_PER_PAGE);
  }, [collections, page]);

  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [targetCollection, setTargetCollection] = useState<Collection | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    visibility: "PRIVATE" // PRIVATE or PUBLIC
  });

  const fetchData = async () => {
    try {
      const res = await axios.get<Collection[]>("/api/collections");
      setCollections(res.data || []);
    } catch (err) {
      console.error("Failed to load collections:", err);
      toast.error("Failed to load collections. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [session]);

  const resetForm = () => {
    setFormData({ name: "", description: "", visibility: "PRIVATE" });
    setTargetCollection(null);
  };

  // Handlers for creating
  const handleCreateSubmit = async () => {
    if (!formData.name.trim()) return;
    setIsSubmitting(true);
    try {
      await axios.post("/api/collections", formData);
      toast.success("Collection created successfully.");
      setIsCreateOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create collection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handlers for editing
  const openEdit = (collection: Collection) => {
    setTargetCollection(collection);
    setFormData({
      name: collection.name,
      description: collection.description || "",
      visibility: collection.visibility
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!targetCollection || !formData.name.trim()) return;
    setIsSubmitting(true);
    try {
      await axios.patch(`/api/collections/${targetCollection.id}`, formData);
      toast.success("Collection updated successfully.");
      setIsEditOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update collection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handlers for deleting
  const openDelete = (collection: Collection) => {
    setTargetCollection(collection);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!targetCollection) return;
    setIsSubmitting(true);
    try {
      await axios.delete(`/api/collections/${targetCollection.id}`);
      toast.success("Collection deleted successfully.");
      setIsDeleteOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete collection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="h-8 w-8 xl:h-10 xl:w-10 rounded-[10px] bg-primary flex items-center justify-center">
              <FolderOpen className="h-4 w-4 xl:h-5 xl:w-5 text-white" />
            </div>
            <h1 className="text-2xl xl:text-3xl 2xl:text-4xl font-bold tracking-tight text-foreground">
              Collections
            </h1>
          </div>
          <p className="text-sm xl:text-base text-muted-foreground">
            Group prompts into themed sets for your team
          </p>
        </div>

        {isAdmin && (
          <Button
            className="shrink-0 xl:h-11 xl:text-base xl:px-6 transition-all duration-300 ease-in-out hover:scale-105 active:scale-95"
            onClick={() => { resetForm(); setIsCreateOpen(true); }}
          >
            <Plus className="mr-2 h-4 w-4 xl:h-5 xl:w-5" /> Create Collection
          </Button>
        )}
      </div>

      {/* Collections Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border rounded-xl bg-card border-dashed">
          <div className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-4">
            <Folder className="h-8 w-8 text-primary/40" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-1">
            No Collections Yet
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first collection to start organising your prompts.
          </p>
          {isAdmin && (
             <Button onClick={() => { resetForm(); setIsCreateOpen(true); }} variant="outline" className="transition-all duration-300 ease-in-out hover:scale-105 active:scale-95">
               <Plus className="mr-2 h-4 w-4" /> Create One
             </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {pagedCollections.map((col) => (
              <CollectionCard
                key={col.id}
                collection={col}
                isAdmin={isAdmin}
                onEdit={openEdit}
                onDelete={openDelete}
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

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Collection</DialogTitle>
            <DialogDescription>
              Create a new collection to organise and share prompts.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Collection Name</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Marketing Prompts" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe what this collection is for..." 
              />
            </div>
            <div className="flex items-center justify-between border rounded-lg p-3">
              <div className="flex flex-col gap-1">
                 <Label className="text-sm">Public Visibility</Label>
                 <span className="text-[12px] text-muted-foreground">Allow everyone to see this collection</span>
              </div>
              <Switch 
                checked={formData.visibility === "PUBLIC"}
                onCheckedChange={(checked) => setFormData({...formData, visibility: checked ? "PUBLIC" : "PRIVATE"})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button disabled={!formData.name.trim() || isSubmitting} onClick={handleCreateSubmit}>
              {isSubmitting ? "Saving..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Collection</DialogTitle>
            <DialogDescription>
              Update the details of this collection.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Collection Name</Label>
              <Input 
                id="edit-name" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea 
                id="edit-description" 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="flex items-center justify-between border rounded-lg p-3">
              <div className="flex flex-col gap-1">
                 <Label className="text-sm">Public Visibility</Label>
                 <span className="text-[12px] text-muted-foreground">Allow everyone to see this collection</span>
              </div>
              <Switch 
                checked={formData.visibility === "PUBLIC"}
                onCheckedChange={(checked) => setFormData({...formData, visibility: checked ? "PUBLIC" : "PRIVATE"})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button disabled={!formData.name.trim() || isSubmitting} onClick={handleEditSubmit}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Collection &ldquo;{targetCollection?.name}&rdquo; will be
              permanently deleted. Prompts inside will not be deleted but will be removed from this collection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => { e.preventDefault(); handleDeleteConfirm(); }} 
              disabled={isSubmitting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isSubmitting ? "Deleting..." : "Delete Collection"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
