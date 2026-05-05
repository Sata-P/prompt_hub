"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Folder, Plus, MoreVertical, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/component/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/component/ui/card";
import { Skeleton } from "@/component/ui/skeleton";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Badge } from "@/component/ui/badge"; 
import { useToast } from "@/hooks/use-toast";

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

type Prompt = {
  id: number;
  name: string;
  description: string;
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
    <Card className="hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer relative group">
      <Link href={`/collections/${collection.id}`} className="absolute inset-0 z-0" />
      
      <CardHeader className="relative z-10 pointer-events-none">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-semibold">{collection.name}</CardTitle>
          <div className="flex items-center gap-2 pointer-events-auto">
            {collection.visibility === 'PUBLIC' && (
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-green-500/10 text-green-500 hover:bg-green-500/20">Public</Badge>
            )}
            
            {isAdmin && (
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
                  <DropdownMenuItem onClick={() => onDelete(collection)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        <CardDescription>{collection.description}</CardDescription>
      </CardHeader>

      <CardContent className="relative z-10 pointer-events-none">
        <div className="flex items-center gap-2 mt-4">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Folder className="w-4 h-4" />
              {collection._count?.prompts || 0} Prompts
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * หน้าแสดงรายการ Collections ทั้งหมด
 * สำหรับผู้ดูแลระบบสามารถสร้าง แก้ไข หรือลบ Collection ได้
 */
export default function CollectionsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "EDITOR";
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 9;
  const totalPages = Math.ceil(collections.length / ITEMS_PER_PAGE);
  const pagedCollections = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return collections.slice(start, start + ITEMS_PER_PAGE);
  }, [collections, page, ITEMS_PER_PAGE]);

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
      const [colRes, promptRes] = await Promise.all([
        axios.get<Collection[]>("/api/collections"),
        axios.get<Prompt[]>("/api/prompts")
      ]);
      setCollections(colRes.data || []);
      setPrompts(promptRes.data || []);
    } catch (err) {
      console.error("Failed to load collections data:", err);
      toast({
        title: "Error",
        description: "Failed to load collections. Please try again.",
        variant: "destructive",
      });
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
      toast({ title: "Success", description: "Collection created successfully." });
      setIsCreateOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.response?.data?.error || "Failed to create collection.",
        variant: "destructive"
      });
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
      toast({ title: "Success", description: "Collection updated successfully." });
      setIsEditOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.response?.data?.error || "Failed to update collection.",
        variant: "destructive"
      });
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
      toast({ title: "Success", description: "Collection deleted successfully." });
      setIsDeleteOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.response?.data?.error || "Failed to delete collection.",
        variant: "destructive"
      });
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
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Folder className="h-4 w-4 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Collections
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Group prompts into themed sets for your team
          </p>
        </div>
        
        {isAdmin && (
          <Button 
            className="shrink-0"
            onClick={() => { resetForm(); setIsCreateOpen(true); }}
          >
            <Plus className="mr-2 h-4 w-4" /> Create Collection
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
             <Button onClick={() => { resetForm(); setIsCreateOpen(true); }} variant="outline">
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
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
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
