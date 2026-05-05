"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Folder, Hash, Plus, Trash2, X, Save, Users, ShieldAlert } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/component/ui/card";
import { Button } from "@/component/ui/button";
import { Skeleton } from "@/component/ui/skeleton";
import { Badge } from "@/component/ui/badge";
import { Input } from "@/component/ui/input";

type Category = {
  id: number;
  name: string;
  description: string | null;
  color: string | null;
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
      setCategories(prev => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
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
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await axios.delete(`/api/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to delete user");
    }
  };

  if (status === "loading" || session?.user?.role !== "ADMIN") {
    return null;
  }

  // We omit the outer div wrapper so it takes the structure of AppLayout
  return (
    <div className="pb-20 max-w-5xl mx-auto space-y-8 fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground mt-1">Manage categories and tags for all prompts</p>
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
              <Button size="sm" variant="ghost" className="h-8" onClick={() => setIsAddingCategory(true)}>
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
                <Button size="sm" onClick={handleCreateCategory} disabled={categorySaving || !newCategoryName.trim()}>
                  <Save className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setIsAddingCategory(false)} disabled={categorySaving}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : categories.length === 0 && !isAddingCategory ? (
              <div className="text-center py-6 text-muted-foreground bg-muted/20 border rounded-lg border-dashed">
                No categories created yet
              </div>
            ) : (
              <ul className="space-y-2">
                {categories.map(cat => (
                  <li key={cat.id} className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/30 transition-colors">
                    <div>
                      <div className="font-medium text-sm">{cat.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{cat.description || "No description"}</div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
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
              <CardDescription className="mt-1.5">Manage all tags used in the system</CardDescription>
            </div>
            {!isAddingTag && (
              <Button size="sm" variant="ghost" className="h-8" onClick={() => setIsAddingTag(true)}>
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
                <Button size="sm" onClick={handleCreateTag} disabled={tagSaving || !newTagName.trim()}>
                  <Save className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setIsAddingTag(false)} disabled={tagSaving}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {loading ? (
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-6 w-24" />
              </div>
            ) : tags.length === 0 && !isAddingTag ? (
              <div className="text-center py-6 text-muted-foreground bg-muted/20 border rounded-lg border-dashed">
                No tags created yet
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
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
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground bg-muted/20 border rounded-lg border-dashed">
                No users found
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Username</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Email</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Role</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground text-right w-[180px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-medium">{user.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                        <td className="px-4 py-3">
                          <Badge variant={user.role === 'ADMIN' ? 'destructive' : user.role === 'EDITOR' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                          <select 
                            className="text-sm rounded-md border border-input bg-background px-2 py-1.5 w-24 focus:ring-1 focus:ring-primary focus:outline-none"
                            value={user.role}
                            onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                            disabled={user.id === Number(session?.user?.id)}
                          >
                            <option value="VIEWER">VIEWER</option>
                            <option value="EDITOR">EDITOR</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={user.id === Number(session?.user?.id)}
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
