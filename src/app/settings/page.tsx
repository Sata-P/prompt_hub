"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Folder, Hash, Plus, Trash2, X, Save, Users, ShieldAlert, ExternalLink, Search, Settings } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/component/ui/card";
import { Button } from "@/component/ui/button";
import { Skeleton } from "@/component/ui/skeleton";
import { Badge } from "@/component/ui/badge";
import { Input } from "@/component/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/component/ui/alert-dialog";
import { ScrollArea } from "@/component/ui/scroll-area";

type Category = {
  id: number;
  name: string;
  description: string | null;
  color: string | null;
  prompts?: { id: number; title: string }[];
  _count?: { prompts: number };
  array_count?: number;
};

type Tag = {
  id: number;
  name: string;
};

type AppUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
};

/**
 * Settings Page for Administrator (ADMIN)
 * Used for managing Categories, Tags, and Users
 */
export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categorySaving, setCategorySaving] = useState(false);

  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [tagSaving, setTagSaving] = useState(false);

  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [viewingCategoryPrompts, setViewingCategoryPrompts] = useState<Category | null>(null);

  // Search and Pagination States
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [tagSearchQuery, setTagSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userPage, setUserPage] = useState(1);
  const usersPerPage = 10;

  // Filtered and Paginated Data
  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(categorySearchQuery.toLowerCase())
  );
  
  const filteredTags = tags.filter(t => 
    t.name.toLowerCase().includes(tagSearchQuery.toLowerCase())
  );
  
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
  );
  
  const totalUserPages = Math.ceil(filteredUsers.length / usersPerPage) || 1;
  const paginatedUsers = filteredUsers.slice((userPage - 1) * usersPerPage, userPage * usersPerPage);

  useEffect(() => {
    setUserPage(1);
  }, [userSearchQuery]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.replace("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status !== "authenticated" || session?.user?.role !== "ADMIN") return;

    const fetchData = async () => {
      try {
        const [catRes, tagRes, usersRes] = await Promise.all([
          axios.get<Category[]>("/api/categories"),
          axios.get<Tag[]>("/api/tags"),
          axios.get<AppUser[]>("/api/users")
        ]);
        setCategories(catRes.data || []);
        setTags(tagRes.data || []);
        setUsers(usersRes.data || []);
      } catch (err) {
        console.error("Failed to load settings data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [status, session]);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setCategorySaving(true);
    try {
      const res = await axios.post("/api/categories", { name: newCategoryName.trim() });
      setCategories(prev => [...prev, res.data.category ?? res.data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewCategoryName("");
      setIsAddingCategory(false);
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to create category");
    } finally {
      setCategorySaving(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await axios.delete(`/api/categories/${id}`);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to delete category");
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    setTagSaving(true);
    try {
      const res = await axios.post("/api/tags", { name: newTagName.trim() });
      setTags(prev => {
        // Prevent duplicate in UI if upsert returned existing one not already in state
        if (prev.some(t => t.id === res.data.id)) return prev;
        return [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name));
      });
      setNewTagName("");
      setIsAddingTag(false);
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to create tag");
    } finally {
      setTagSaving(false);
    }
  };

  const handleDeleteTag = async (id: number) => {
    if (!confirm("Are you sure you want to delete this tag?")) return;
    try {
      await axios.delete(`/api/tags/${id}`);
      setTags(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to delete tag");
    }
  };

  const handleUpdateRole = async (userId: number, newRole: string) => {
    try {
      const res = await axios.patch(`/api/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: res.data.role } : u));
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to update role");
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await axios.delete(`/api/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to deactivate user");
    }
  };

  if (status === "loading" || session?.user?.role !== "ADMIN") {
    return null;
  }

  // We omit the outer div wrapper so it takes the structure of AppLayout
  return (
    <>
    <div className="pb-20 max-w-5xl mx-auto space-y-8 fade-in-up">
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="h-8 w-8 xl:h-10 xl:w-10 rounded-[10px] bg-primary flex items-center justify-center">
            <Settings className="h-4 w-4 xl:h-5 xl:w-5 text-white" />
          </div>
          <h1 className="text-2xl xl:text-3xl 2xl:text-4xl font-bold tracking-tight">System Settings</h1>
        </div>
        <p className="text-sm xl:text-base text-muted-foreground mt-1">Manage categories and tags for all prompts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Categories Manager */}
        <Card className="flex flex-col h-full border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-5 w-5 text-blue-500" /> Categories
              </CardTitle>
              <CardDescription className="mt-1.5">Group prompts by usage type</CardDescription>
            </div>
            {!isAddingCategory && (
              <Button size="sm" variant="ghost" className="h-8 transition-all duration-300 ease-in-out hover:scale-105 active:scale-95" onClick={() => setIsAddingCategory(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            )}
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            {isAddingCategory && (
              <div className="flex items-center gap-2 bg-muted/50 p-3 rounded-lg border">
                <Input 
                  placeholder="New category name..." 
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  disabled={categorySaving}
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleCreateCategory()}
                />
                <Button size="sm" onClick={handleCreateCategory} disabled={categorySaving || !newCategoryName.trim()} className="transition-all duration-300 hover:scale-105 active:scale-95">
                  <Save className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setIsAddingCategory(false)} disabled={categorySaving} className="transition-all duration-300 hover:scale-105 active:scale-95">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                className="pl-9 bg-background h-9"
                value={categorySearchQuery}
                onChange={(e) => setCategorySearchQuery(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : categories.length === 0 && !isAddingCategory ? (
              <div className="text-center py-6 text-muted-foreground bg-muted/20 border rounded-lg border-dashed">
                {categories.length === 0 ? "No categories created yet." : "No categories found."}
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <ul className="space-y-2">
                  {filteredCategories.map(cat => (
                    <li key={cat.id} className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/30 transition-colors">
                      <div className="min-w-0 flex-1 pr-4 overflow-hidden">
                        <div className="font-medium text-sm truncate w-full">
                          {cat.name}
                          {(cat.array_count ?? 0) > 0 && (
                            <span 
                              className="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors"
                              onClick={() => setViewingCategoryPrompts(cat)}
                            >
                              {cat.array_count}
                            </span>
                          )}
                        </div>
                        {cat.prompts && cat.prompts.length > 0 ? (
                          <div 
                            className="text-xs text-muted-foreground mt-1 truncate cursor-pointer hover:text-primary transition-colors w-full"
                            onClick={() => setViewingCategoryPrompts(cat)}
                            title={`Prompts: ${cat.prompts.map(p => p.title).join(", ")}`}
                          >
                            Prompts: {cat.prompts.slice(0, 2).map(p => p.title).join(", ")}
                            {cat.prompts.length > 2 && ` ... (+${cat.prompts.length - 2} more)`}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground/50 mt-1">No prompts linked</div>
                        )}
                      </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive hover:text-destructive-foreground shrink-0 transition-all duration-300 hover:scale-110 active:scale-95"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
                </ul>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Tags Manager */}
        <Card className="flex flex-col h-full border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-green-500" /> Tags
              </CardTitle>
              <CardDescription className="mt-1.5">Manage all tags used across prompts</CardDescription>
            </div>
            {!isAddingTag && (
              <Button size="sm" variant="ghost" className="h-8 transition-all duration-300 ease-in-out hover:scale-105 active:scale-95" onClick={() => setIsAddingTag(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            )}
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            {isAddingTag && (
              <div className="flex items-center gap-2 bg-muted/50 p-3 rounded-lg border">
                <Input 
                  placeholder="Type new tag..." 
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  disabled={tagSaving}
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleCreateTag()}
                />
                <Button size="sm" onClick={handleCreateTag} disabled={tagSaving || !newTagName.trim()} className="transition-all duration-300 hover:scale-105 active:scale-95">
                  <Save className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setIsAddingTag(false)} disabled={tagSaving} className="transition-all duration-300 hover:scale-105 active:scale-95">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tags..."
                className="pl-9 bg-background h-9"
                value={tagSearchQuery}
                onChange={(e) => setTagSearchQuery(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-6 w-24" />
              </div>
            ) : tags.length === 0 && !isAddingTag ? (
              <div className="text-center py-6 text-muted-foreground bg-muted/20 border rounded-lg border-dashed">
                {tags.length === 0 ? "No tags created yet." : "No tags found."}
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="flex flex-wrap gap-2">
                  {filteredTags.map(tag => (
                    <Badge key={tag.id} variant="secondary" className="px-3 py-1 flex items-center gap-1.5 group">
                      #{tag.name}
                    <span 
                      onClick={() => handleDeleteTag(tag.id)}
                      className="cursor-pointer text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      &times;
                    </span>
                  </Badge>
                ))}
                  </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Users Manager */}
        <Card className="flex flex-col h-full border shadow-sm md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-500" /> Users & Roles Management
              </CardTitle>
              <CardDescription className="mt-1.5">Change access rights (Role) of users in the system</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                className="pl-9 bg-background h-9"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground bg-muted/20 border rounded-lg border-dashed">
                {users.length === 0 ? "No users found." : "No users match your search."}
              </div>
            ) : (
              <>
                {/* Desktop View */}
                <div className="rounded-md border overflow-hidden hidden md:block">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground">Email</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground">Role</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground text-right w-[180px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedUsers.map(user => (
                        <tr key={user.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-medium">{user.name}</td>
                          <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <Badge variant={user.role === 'ADMIN' ? 'destructive' : user.role === 'EDITOR' ? 'default' : 'secondary'}>
                                {user.role}
                              </Badge>
                              {user.status === 'deactivated' && (
                                <Badge variant="outline" className="text-muted-foreground bg-muted">
                                  Deactivated
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                            <select 
                              className="text-sm rounded-md border border-input bg-background px-2 py-1.5 w-24 focus:ring-1 focus:ring-primary focus:outline-none"
                              value={user.role}
                              onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                              disabled={user.id === Number(session?.user?.id) || user.status === 'deactivated'}
                            >
                              <option value="VIEWER">VIEWER</option>
                              <option value="EDITOR">EDITOR</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => {
                                setUserToDelete(user);
                                setIsDeleteOpen(true);
                              }}
                              disabled={user.id === Number(session?.user?.id) || user.status === 'deactivated'}
                              className="h-8 w-8 p-0 text-destructive hover:bg-destructive hover:text-destructive-foreground disabled:opacity-30 disabled:pointer-events-none transition-all duration-300 hover:scale-110 active:scale-95"
                              title={user.status === 'deactivated' ? "User already deactivated" : "Deactivate user"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View */}
                <div className="space-y-4 md:hidden">
                  {paginatedUsers.map(user => (
                    <div key={user.id} className="border rounded-lg p-4 space-y-3 bg-card shadow-sm">
                      <div className="flex justify-between items-start">
                        <div className="min-w-0">
                          <p className="font-bold text-foreground truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <div className="flex flex-col gap-1 items-end shrink-0">
                          <Badge variant={user.role === 'ADMIN' ? 'destructive' : user.role === 'EDITOR' ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                            {user.role}
                          </Badge>
                          {user.status === 'deactivated' && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground bg-muted">
                              Deactivated
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/50">
                        <select 
                          className="text-xs rounded-md border border-input bg-background px-2 py-1.5 flex-1 focus:ring-1 focus:ring-primary focus:outline-none"
                          value={user.role}
                          onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                          disabled={user.id === Number(session?.user?.id) || user.status === 'deactivated'}
                        >
                          <option value="VIEWER">VIEWER</option>
                          <option value="EDITOR">EDITOR</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setUserToDelete(user);
                            setIsDeleteOpen(true);
                          }}
                          disabled={user.id === Number(session?.user?.id) || user.status === 'deactivated'}
                          className="text-destructive border-destructive/20 hover:bg-destructive hover:text-white shrink-0 transition-all duration-300 hover:scale-105 active:scale-95"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> Deactivate
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalUserPages > 1 && (
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-muted-foreground">
                      Page {userPage} of {totalUserPages}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUserPage(p => Math.max(1, p - 1))}
                        disabled={userPage === 1}
                        className="transition-all duration-300 hover:scale-105 active:scale-95"
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUserPage(p => Math.min(totalUserPages, p + 1))}
                        disabled={userPage === totalUserPages}
                        className="transition-all duration-300 hover:scale-105 active:scale-95"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate <strong>{userToDelete?.name}</strong>? They will no longer be able to log in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (userToDelete) {
                  handleDeleteUser(userToDelete.id);
                  setIsDeleteOpen(false);
                }
              }}
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>

      {/* Pop up showing prompts for a category - outside fade-in-up to fix fixed positioning */}
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
    </>
  );
}
