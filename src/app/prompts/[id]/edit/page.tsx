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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/component/ui/select";

type Category = { id: number; name: string };
type Tag = { id: number; name: string };
type ModelInfo = { id: string; name: string };

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
  recommended_model: string | null;
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
  
  // Categories and Models
  const [categories, setCategories] = useState<Category[]>([]);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [recommendedModel, setRecommendedModel] = useState<string>("");

  useEffect(() => {
    if (!id) return;

    const fetchInitialData = async () => {
      try {
        const [catsRes, modelsRes, promptRes] = await Promise.all([
          axios.get<Category[]>("/api/categories"),
          axios.get<{models: ModelInfo[], defaultModel: string}>("/api/llm/models"),
          axios.get<PromptDetail>(`/api/prompts/${id}`)
        ]);

        setCategories(catsRes.data || []);
        setModels(modelsRes.data.models || []);

        const prompt = promptRes.data;
        setTitle(prompt.title);
        setDescription(prompt.description || "");
        setCategoryId(prompt.category ? String(prompt.category.id) : "");
        setRecommendedModel(prompt.recommended_model || "");
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
      setError("Title and template content are required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const promptPayload = {
        title,
        description: description || undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
        recommendedModel: recommendedModel || undefined,
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
        setError("Failed to update prompt. Please try again.");
      }
      setSaving(false);

    }
  };

  if (loadingContext) {
    return <div className="py-20 text-center text-muted-foreground">Loading prompt data...</div>;
  }

  if (error && !title) { 
    return (
      <div className="py-20 text-center max-w-lg mx-auto">
        <div className="bg-destructive/10 text-destructive p-6 rounded-lg mb-6">
          <ShieldAlert className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Unable to Edit Prompt</h2>
          <p>{error}</p>
        </div>
        <Button asChild><Link href="/prompts">Back to Prompt Library</Link></Button>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <main className="py-4">
        <Button variant="ghost" className="mb-6 -ml-4" asChild>
          <Link href={`/prompts/${id}`}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Prompt</Link>
        </Button>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b pb-6">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">Edit <span className="text-primary">Prompt</span></h1>
              <p className="text-lg text-muted-foreground">Update details or refine the template content to improve prompt performance.</p>
            </div>
            <Button type="submit" disabled={saving} size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20 transition-transform active:scale-95">
              <Save className="mr-2 h-5 w-5" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>

          {error && title && (
             <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6 font-medium">
               {error}
             </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8 xl:gap-12 items-start">
            <div className="space-y-6 lg:sticky lg:top-6">
              <section className="flex flex-col gap-6">
                <div className="pb-2 border-b">
                  <h2 className="text-xl font-bold font-heading flex items-center gap-2">
                    <span className="bg-primary/10 p-1.5 rounded-md"><Sparkles className="h-4 w-4 text-primary" /></span>
                    General Information
                  </h2>
                </div>
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="title" className="text-base font-semibold">Prompt Title <span className="text-destructive">*</span></Label>
                    <Input 
                      id="title" 
                      placeholder="e.g. Write a resume, Summarize an article..." 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="h-11"
                      required
                    />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="description" className="text-sm font-semibold">Description (Optional)</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Briefly describe what this prompt does..." 
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="category" className="text-sm font-semibold">Category</Label>
                        <Select
                          value={categoryId || "none"}
                          onValueChange={(val) => setCategoryId(val === "none" ? "" : val)}
                        >
                          <SelectTrigger id="category" className="h-10 bg-background">
                            <SelectValue placeholder="-- None --" />
                          </SelectTrigger>
                          <SelectContent position="popper" side="bottom">
                            <SelectItem value="none">-- None --</SelectItem>
                            {categories.map(cat => (
                              <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label htmlFor="model" className="text-sm font-semibold">Recommended AI Model</Label>
                        <Select
                          value={recommendedModel || "none"}
                          onValueChange={(val) => setRecommendedModel(val === "none" ? "" : val)}
                        >
                          <SelectTrigger id="model" className="h-10 bg-background">
                            <SelectValue placeholder="-- None (use Default) --" />
                          </SelectTrigger>
                          <SelectContent position="popper" side="bottom">
                            <SelectItem value="none">-- None (use Default) --</SelectItem>
                            {models.map(m => (
                              <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="tags" className="text-sm font-semibold">Tags (press Enter to add)</Label>
                      <Input 
                        id="tags" 
                        placeholder="Add a tag..." 
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                      />
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {tags.map(t => (
                            <div key={t} className="flex items-center gap-1 bg-primary/10 text-primary font-medium text-xs px-2.5 py-1 rounded-full border border-primary/20">
                              {t}
                              <button type="button" onClick={() => removeTag(t)} className="text-primary hover:text-primary/70 transition-colors">
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="flex flex-col h-full gap-6">
                <div className="pb-2 border-b flex justify-between items-end">
                  <h2 className="text-xl font-bold font-heading flex items-center gap-2">
                    <span className="bg-primary/10 p-1.5 rounded-md"><Sparkles className="h-4 w-4 text-primary" /></span>
                    Template Content
                  </h2>
                </div>
                <div className="flex flex-col gap-6 flex-1">
                  <Textarea 
                    id="templateContent" 
                    placeholder="Type your prompt template here. Use {{variable}} for dynamic fields..." 
                    className="font-mono text-sm leading-relaxed flex-1 min-h-[450px] bg-muted/30"
                    value={templateContent}
                    onChange={(e) => setTemplateContent(e.target.value)}
                    required
                  />

                  {variables.length > 0 && (
                    <div className="bg-primary/[0.04] rounded-xl border border-primary/20 p-5 flex flex-col gap-5">
                      <div className="flex items-center gap-2 font-semibold text-base text-primary">
                        <Sparkles className="h-5 w-5" /> Detected Variables ({variables.length})
                      </div>
                      <div className="flex flex-col gap-4">
                        {variables.map((v, idx) => (
                          <div key={idx} className="grid grid-cols-[1fr_2fr] gap-4 items-start bg-background/60 p-3 rounded-lg border border-primary/10 shadow-sm">
                            <div>
                              <div className="font-mono text-sm font-bold text-primary mb-2 truncate" title={v.name}>
                                {"{{"}{v.name.length > 22 ? v.name.substring(0, 18) + "..." : v.name}{"}}"}
                              </div>
                              <select 
                                className="w-full text-xs h-8 rounded-md border border-input bg-background px-2"
                                value={v.type}
                                onChange={(e) => updateVariable(v.name, "type", e.target.value)}
                              >
                                <option value="TEXT">Text (TEXT)</option>
                                <option value="TEXTAREA">Long Text (TEXTAREA)</option>
                                <option value="NUMBER">Number (NUMBER)</option>
                                <option value="BOOLEAN">Yes/No (BOOLEAN)</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <Input 
                                placeholder="Label / Variable name in template" 
                                className="h-8 text-xs font-mono" 
                                value={v.name} 
                                onChange={(e) => renameVariable(v.name, e.target.value)} 
                              />
                              <Input 
                                placeholder="Description" 
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

                </div>
              </section>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
