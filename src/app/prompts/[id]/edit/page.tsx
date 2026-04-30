"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { ArrowLeft, Save, ShieldAlert, Sparkles } from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/component/ui/card";
import { Button } from "@/component/ui/button";
import { Input } from "@/component/ui/input";
import { Label } from "@/component/ui/label";
import { Textarea } from "@/component/ui/textarea";

type Category = { id: number; name: string };
type Tag = { id: number; name: string };

type PromptVariable = {
  id: number;
  name: string;
  type: string;
  label: string | null;
  description: string | null;
};

type PromptDetail = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  category: { id: number; name: string } | null;
  tags: Tag[];
  versions: {
    id: number;
    version_no: number;
    template_content: string;
    promptVariables: PromptVariable[];
  }[];
};

type VariableConfig = {
  name: string;
  type: string;
  label: string;
  description: string;
};

/**
 * หน้าแก้ไขข้อมูล Prompt
 * โหลดข้อมูล Prompt ตาม `params.id` เพื่อนำมาแก้ไข และสร้าง Version ใหม่เมื่อบันทึก
 */
export default function EditPromptPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [loadingContext, setLoadingContext] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  // Data State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [templateContent, setTemplateContent] = useState("");
  
  // Variables State
  const [variables, setVariables] = useState<VariableConfig[]>([]);
  
  // Categories lookup
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (!id) return;

    const fetchInitialData = async () => {
      try {
        const [catsRes, promptRes] = await Promise.all([
          axios.get<Category[]>("/api/categories"),
          axios.get<PromptDetail>(`/api/prompts/${id}`)
        ]);

        setCategories(catsRes.data || []);

        const prompt = promptRes.data;
        setTitle(prompt.title);
        setDescription(prompt.description || "");
        setCategoryId(prompt.category ? String(prompt.category.id) : "");
        setTags(prompt.tags.map(t => t.name));
        
        if (prompt.versions && prompt.versions.length > 0) {
          const latestVer = prompt.versions[0];
          setTemplateContent(latestVer.template_content);
          
          if (latestVer.promptVariables) {
            setVariables(latestVer.promptVariables.map(v => ({
              name: v.name,
              type: v.type,
              label: v.label || v.name,
              description: v.description || ""
            })));
          }
        }

      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load prompt for editing");
      } finally {
        setLoadingContext(false);
      }
    };

    fetchInitialData();
  }, [id]);

  // Detect variables from template {{var_name}}
  useEffect(() => {
    if (loadingContext) return;

    const rawMatches = Array.from(templateContent.matchAll(/\{\{\s*([a-zA-Z0-9_]*)\s*\}\}/g));
    const detectedNames = Array.from(new Set(rawMatches.map(m => m[1])));

    setVariables(prev => {
      const nextVars = detectedNames.map(name => {
        const existing = prev.find(v => v.name === name);
        if (existing) return existing;
        return { name, type: "TEXT", label: name, description: "" };
      });
      return nextVars;
    });
  }, [templateContent, loadingContext]);

  const updateVariable = (name: string, field: keyof VariableConfig, value: string) => {
    setVariables(prev => prev.map(v => v.name === name ? { ...v, [field]: value } : v));
  };

  const renameVariable = (oldName: string, newNameRaw: string) => {
    const newName = newNameRaw.replace(/[^a-zA-Z0-9_]/g, '');
    if (oldName === newName) return;

    setVariables(prev => prev.map(v => v.name === oldName ? { ...v, name: newName } : v));

    setTemplateContent(prev => {
      if (oldName === "") {
        return prev.replace(/\{\{\s*\}\}/g, `{{${newName}}}`);
      }
      return prev.replace(new RegExp(`\\{\\{\\s*${oldName}\\s*\\}\\}`, 'g'), `{{${newName}}}`);
    });
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !templateContent) {
      setError("กรุณากรอกหัวข้อ และเนื้อหาของ Prompt");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const promptPayload = {
        title,
        description: description || undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
        tags,
      };
      
      await axios.patch(`/api/prompts/${id}`, promptPayload);

      const versionPayload = {
        templateContent,
        variables: variables.length > 0 ? variables : undefined
      };

      await axios.post(`/api/prompts/${id}/versions`, versionPayload);

      router.push(`/prompts/${id}`);

    } catch (err: any) {

      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("ไม่สามารถอัปเดต Prompt ได้ เกิดข้อผิดพลาด");
      }
      setSaving(false);

    }
  };

  if (loadingContext) {
    return <div className="py-20 text-center text-muted-foreground">กำลังโหลดข้อมูล...</div>;
  }

  if (error && !title) { 
    return (
      <div className="py-20 text-center max-w-lg mx-auto">
        <div className="bg-destructive/10 text-destructive p-6 rounded-lg mb-6">
          <ShieldAlert className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">ไม่สามารถแก้ไข Prompt ได้</h2>
          <p>{error}</p>
        </div>
        <Button asChild><Link href="/prompts">กลับไปที่คลัง Prompt</Link></Button>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <main className="py-4">
        <Button variant="ghost" className="mb-6 -ml-4" asChild>
          <Link href={`/prompts/${id}`}><ArrowLeft className="mr-2 h-4 w-4" /> ย้อนกลับ</Link>
        </Button>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">แก้ไข ยกระดับผลลัพธ์</h1>
              <p className="text-muted-foreground mt-1">อัปเดตรายละเอียด หรือแก้ไข Template Content</p>
            </div>
            <Button type="submit" disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Change"}
            </Button>
          </div>

          {error && title && (
             <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6 font-medium">
               {error}
             </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>ข้อมูลทั่วไป (General Info)</CardTitle>
                  <CardDescription>รายละเอียดพื้นฐานที่จะช่วยให้คุณจำได้ว่า Prompt นี้มีไว้ทำอะไร</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">ชื่อ Prompt <span className="text-destructive">*</span></Label>
                    <Input 
                      id="title" 
                      placeholder="เช่น: เขียนเรซูเม่สมัครงาน, สรุปบทความ..." 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">รายละเอียด (Optional)</Label>
                    <Textarea 
                      id="description" 
                      placeholder="อธิบายสั้นๆ ว่า Prompt นี้ใช้งานยังไง..." 
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="category">หมวดหมู่</Label>
                      <div className="relative">
                        <select 
                          id="category"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          value={categoryId}
                          onChange={(e) => setCategoryId(e.target.value)}
                        >
                          <option value="">-- ไม่ระบุ --</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags (พิมพ์แล้วกด Enter)</Label>
                      <Input 
                        id="tags" 
                        placeholder="เพิ่ม tag..." 
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                      />
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {tags.map(t => (
                            <div key={t} className="flex items-center gap-1 bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-md">
                              {t}
                              <button type="button" onClick={() => removeTag(t)} className="text-muted-foreground hover:text-foreground">
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              <Card className="flex flex-col h-full">
                <CardHeader>
                  <CardTitle>เนื้อหาคำสั่ง (Template Content)</CardTitle>
                  <CardDescription>เนื้อหา Prompt พร้อมใส่ตัวแปร (เช่น {"{{name}}" }, {"{{topic}}" })</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6 flex-1">
                  <Textarea 
                    id="templateContent" 
                    placeholder="พิมพ์ข้อความ prompt ของคุณที่นี่..." 
                    className="font-mono text-sm leading-relaxed flex-1 min-h-[250px] bg-muted/30"
                    value={templateContent}
                    onChange={(e) => setTemplateContent(e.target.value)}
                    required
                  />

                  {variables.length > 0 && (
                    <div className="bg-muted/30 rounded-lg border p-4 space-y-4">
                      <div className="flex items-center gap-2 font-semibold">
                        <Sparkles className="h-4 w-4 text-primary" /> ตัวแปรที่ตรวจพบ ({variables.length})
                      </div>
                      <div className="space-y-4">
                        {variables.map((v, idx) => (
                          <div key={idx} className="grid grid-cols-[1fr_2fr] gap-4 items-start border-l-2 border-primary/50 pl-3">
                            <div>
                              <div className="font-mono text-sm font-bold text-primary mb-2 truncate" title={v.name}>
                                {"{{"}{v.name.length > 22 ? v.name.substring(0, 18) + "..." : v.name}{"}}"}
                              </div>
                              <select 
                                className="w-full text-xs h-8 rounded-md border border-input bg-background px-2"
                                value={v.type}
                                onChange={(e) => updateVariable(v.name, "type", e.target.value)}
                              >
                                <option value="TEXT">ข้อความ (TEXT)</option>
                                <option value="TEXTAREA">ข้อความยาว (TEXTAREA)</option>
                                <option value="NUMBER">ตัวเลข (NUMBER)</option>
                                <option value="BOOLEAN">ใช่/ไม่ใช่ (BOOLEAN)</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <Input 
                                placeholder="ชื่อที่แสดงและอยู่ใน Template (Label / Variable)" 
                                className="h-8 text-xs font-mono" 
                                value={v.name} 
                                onChange={(e) => renameVariable(v.name, e.target.value)} 
                              />
                              <Input 
                                placeholder="คำอธิบาย (Description)" 
                                className="h-8 text-xs" 
                                value={v.description} 
                                onChange={(e) => updateVariable(v.name, "description", e.target.value)} 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
