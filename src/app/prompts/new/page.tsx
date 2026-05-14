"use client";

// ไฟล์นี้: หน้าสร้าง Prompt ใหม่ (Create Prompt Page)
// ผู้ใช้กรอกชื่อ, รายละเอียด, หมวดหมู่, tags และ template content
// ระบบจะ detect ตัวแปร {{variable}} ใน template โดยอัตโนมัติ

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { LayoutGrid, ArrowLeft, Save, ShieldAlert, Sparkles } from "lucide-react";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/component/ui/dropdown-menu";
import { ScrollArea } from "@/component/ui/scroll-area";
import { ChevronDown, Tag as TagIcon, X } from "lucide-react";
import { PROVIDER_MODELS } from "@/lib/llm";

// Type สำหรับข้อมูลหมวดหมู่ที่ดึงมาจาก API
type Category = { id: number; name: string };

// Type สำหรับ Model AI
type ModelInfo = { id: string; name: string };

// Type สำหรับ config ของตัวแปรแต่ละตัวที่ตรวจพบใน template
type VariableConfig = {
  name: string;        // ชื่อตัวแปร (เช่น "topic")
  type: string;        // ประเภท input (TEXT, TEXTAREA, NUMBER, BOOLEAN, SELECT)
  label: string;       // ชื่อที่แสดงให้ผู้ใช้เห็น
  description: string; // คำอธิบายเพิ่มเติม
  options: string[];   // ใช้เฉพาะเมื่อ type === "SELECT"
};

export default function CreatePromptPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // --- State สำหรับข้อมูลหลักของฟอร์ม ---
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [tagInput, setTagInput] = useState("");     // ค่าใน input ก่อน add
  const [tags, setTags] = useState<string[]>([]);   // รายการ tags ที่เพิ่มแล้ว
  const [templateContent, setTemplateContent] = useState("");
  
  // --- State สำหรับตัวแปรที่ detect ได้จาก template ---
  const [variables, setVariables] = useState<VariableConfig[]>([]);
  
  // --- State สำหรับ list ของหมวดหมู่ (โหลดครั้งเดียวตอน mount) ---
  const [categories, setCategories] = useState<Category[]>([]);
  
  // --- State สำหรับ list ของ AI Models ---
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [recommendedModel, setRecommendedModel] = useState<string>("");
  
  // --- State สำหรับรายการ Tags ทั้งหมดในระบบ (เพื่อใช้เป็นตัวเลือก) ---
  const [availableTags, setAvailableTags] = useState<{ id: number; name: string }[]>([]);

  // โหลดหมวดหมู่จาก API ตอนที่ component mount
  useEffect(() => {
    axios.get<Category[]>("/api/categories")
      .then(res => setCategories(res.data || []))
      .catch(err => console.error("Failed to load categories:", err));

    // Static model list (BYOK — no API key needed at this stage)
    setModels([...PROVIDER_MODELS.openai, ...PROVIDER_MODELS.gemini]);

    axios.get<{ id: number; name: string }[]>("/api/tags")
      .then(res => setAvailableTags(res.data || []))
      .catch(err => console.error("Failed to load tags:", err));
  }, []);

  // -------------------------------------------------------
  // useEffect: ตรวจจับตัวแปร {{variable}} ใน templateContent
  // - ใช้ regex จับทุก {{...}} ที่เป็น alphanumeric + underscore
  // - deduplicate ด้วย Set
  // - คงค่า config เดิมของตัวแปรที่มีอยู่แล้ว (ไม่ reset ทุกครั้ง)
  // -------------------------------------------------------
  useEffect(() => {
    const rawMatches = Array.from(templateContent.matchAll(/\{\{\s*([a-zA-Z0-9_]*)\s*\}\}/g));
    const detectedNames = Array.from(new Set(rawMatches.map(m => m[1])));

    setVariables(prev => {
      // สำหรับแต่ละชื่อที่ detect ได้:
      // - ถ้าเคยมีอยู่แล้ว → ใช้ config เดิม (ไม่ reset)
      // - ถ้าใหม่ → สร้าง default config
      const nextVars = detectedNames.map(name => {
        const existing = prev.find(v => v.name === name);
        if (existing) return existing;
        return { name, type: "TEXT", label: name, description: "", options: [] };
      });
      return nextVars;
    });
  }, [templateContent]);

  // อัปเดต field ของตัวแปรตัวใดตัวหนึ่ง (type / label / description)
  const updateVariable = (name: string, field: keyof VariableConfig, value: string) => {
    setVariables(prev => prev.map(v => v.name === name ? { ...v, [field]: value } : v));
  };

  // เพิ่ม option ให้ตัวแปร SELECT
  // — รองรับ comma-separated input (เช่น "TH, EN, JP") แยกอัตโนมัติ
  // — trim, ตัดค่าว่าง, กัน duplicate (ของเดิม + ของชุดใหม่)
  const addVariableOption = (varName: string, optRaw: string) => {
    const newOpts = optRaw
      .split(",")
      .map(s => s.trim())
      .filter(s => s.length > 0);
    if (newOpts.length === 0) return;
    setVariables(prev => prev.map(v => {
      if (v.name !== varName) return v;
      const merged = [...v.options];
      for (const o of newOpts) {
        if (!merged.includes(o)) merged.push(o);
      }
      return { ...v, options: merged };
    }));
  };

  // ลบ option ออกจากตัวแปร SELECT
  const removeVariableOption = (varName: string, opt: string) => {
    setVariables(prev => prev.map(v =>
      v.name === varName ? { ...v, options: v.options.filter(o => o !== opt) } : v
    ));
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

  // เพิ่ม tag เมื่อกด Enter (ป้องกัน duplicate)
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      e.preventDefault(); // ป้องกัน form submit
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  // ลบ tag ออกจากรายการ
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // -------------------------------------------------------
  // handleSubmit — ส่งข้อมูลไปสร้าง Prompt ผ่าน POST /api/prompts
  // - validate ว่ามี title และ templateContent
  // - ถ้าสำเร็จ → redirect ไปหน้า detail ของ prompt ใหม่
  // -------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !templateContent) {
      setError("Title and template content are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        title,
        description: description || undefined,                      // optional
        categoryId: categoryId ? Number(categoryId) : undefined,    // optional
        recommendedModel: recommendedModel || undefined,            // optional
        tags,
        templateContent,
        // ส่งตัวแปรพร้อม optionsJson (เฉพาะเมื่อ type === SELECT)
        variables: variables.length > 0
          ? variables.map(v => ({
              name: v.name,
              label: v.label || v.name,
              type: v.type,
              description: v.description || undefined,
              optionsJson: v.type === "SELECT" ? v.options : undefined,
            }))
          : undefined
      };

      const res = await axios.post("/api/prompts", payload);
      // redirect ไปหน้า detail ของ prompt ที่เพิ่งสร้าง
      router.push(`/prompts/${res.data.id}`);
    } catch (err: unknown) {
      // แสดง error message จาก API หรือ fallback message
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to create prompt. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="pb-20">
      <main className="py-4">
        {/* ปุ่มย้อนกลับไปหน้า Prompts */}
        <Button variant="ghost" className="mb-6 -ml-4 transition-all duration-300 ease-in-out hover:-translate-x-1 active:scale-95" asChild>
          <Link href="/prompts"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Prompts</Link>
        </Button>

        <form onSubmit={handleSubmit}>
          {/* Header: ชื่อหน้า + ปุ่ม submit */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b pb-6">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">Create <span className="text-primary">New Prompt</span></h1>
            </div>
            <Button type="submit" disabled={loading} size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20 transition-all duration-300 ease-in-out hover:scale-105 active:scale-95">
              <Save className="mr-2 h-5 w-5" />
              {loading ? "Saving..." : "Save Prompt"}
            </Button>
          </div>

          {/* Error message (แสดงเฉพาะเมื่อมี error) */}
          {error && (
             <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6 font-medium flex items-center gap-2">
               <ShieldAlert className="h-5 w-5" /> {error}
             </div>
          )}

          {/* Layout 2 คอลัมน์: ซ้าย = ข้อมูลทั่วไป, ขวา = template content (Asymmetrical Grid) */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8 xl:gap-12 items-start">
            
            {/* คอลัมน์ซ้าย: ข้อมูลทั่วไป */}
            <div className="space-y-6 lg:sticky lg:top-6">
              <section className="flex flex-col gap-6">
                <div className="pb-2 border-b">
                  <h2 className="text-xl font-bold font-heading flex items-center gap-2">
                    <span className="bg-primary/10 p-1.5 rounded-md"><Sparkles className="h-4 w-4 text-primary" /></span>
                    General Information
                  </h2>
                </div>
                
                <div className="flex flex-col gap-8">
                  {/* ชื่อ Prompt (required) */}
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
                  
                  {/* รายละเอียด (optional) */}
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
                    {/* Dropdown เลือกหมวดหมู่ */}
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
                          <SelectContent position="popper">
                            <SelectItem value="none">-- None (use Default) --</SelectItem>
                            {models.map(m => (
                              <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Tags Multi-select Dropdown */}
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="tags" className="text-sm font-semibold flex items-center gap-2">
                        <TagIcon className="h-3.5 w-3.5" /> Tags
                      </Label>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            className="w-full justify-between h-10 px-3 bg-background border-input font-normal hover:bg-background/80 transition-all duration-300 ease-in-out hover:border-primary/50"
                          >
                            <span className="truncate">
                              {tags.length > 0 ? `Selected ${tags.length} tags` : "Select or add tags..."}
                            </span>
                            <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[300px] p-0" align="start">
                          <div className="p-2 border-b bg-muted/30">
                            <Input 
                              placeholder="Search or type new tag..." 
                              value={tagInput}
                              onChange={(e) => setTagInput(e.target.value)}
                              onKeyDown={handleAddTag}
                              className="h-8 text-xs border-none bg-transparent focus-visible:ring-0 shadow-none"
                            />
                          </div>
                          <ScrollArea className="h-60 p-1">
                            {availableTags
                              .filter(t => t.name.toLowerCase().includes(tagInput.toLowerCase()))
                              .map(tag => (
                                <DropdownMenuCheckboxItem
                                  key={tag.id}
                                  checked={tags.includes(tag.name)}
                                  onCheckedChange={() => {
                                    if (tags.includes(tag.name)) {
                                      setTags(tags.filter(t => t !== tag.name));
                                    } else {
                                      setTags([...tags, tag.name]);
                                    }
                                  }}
                                  onSelect={(e) => e.preventDefault()}
                                  className="focus:bg-primary/10 focus:text-primary data-[state=checked]:text-primary"
                                >
                                  {tag.name}
                                </DropdownMenuCheckboxItem>
                              ))}
                            
                            {tagInput && !availableTags.some(t => t.name.toLowerCase() === tagInput.toLowerCase()) && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => {
                                    if (!tags.includes(tagInput.trim())) {
                                      setTags([...tags, tagInput.trim()]);
                                    }
                                    setTagInput("");
                                  }}
                                  className="text-primary font-medium focus:bg-primary/10 focus:text-primary"
                                >
                                  + Add new tag: "{tagInput}"
                                </DropdownMenuItem>
                              </>
                            )}
                          </ScrollArea>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Display selected tags as removable badges */}
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {tags.map(t => (
                            <div 
                              key={t} 
                              className="group flex items-center gap-1 bg-primary/5 text-primary/80 hover:bg-primary/10 hover:text-primary font-medium text-[11px] px-2 py-0.5 rounded-md border border-primary/10 transition-all duration-300 ease-in-out hover:scale-105 active:scale-95"
                            >
                              {t}
                              <button 
                                type="button" 
                                onClick={() => removeTag(t)} 
                                className="text-primary/40 group-hover:text-primary/70 transition-colors"
                              >
                                <X className="h-3 w-3" />
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

            {/* คอลัมน์ขวา: Template Content + ตัวแปร */}
            <div className="space-y-6">
              <section className="flex flex-col h-full gap-6">
                <div className="pb-2 border-b flex justify-between items-end">
                  <h2 className="text-xl font-bold font-heading flex items-center gap-2">
                    <span className="bg-primary/10 p-1.5 rounded-md"><Sparkles className="h-4 w-4 text-primary" /></span>
                    Template Content
                  </h2>
                </div>
                <div className="flex flex-col gap-6 flex-1">
                  {/* Textarea สำหรับพิมพ์ template (required) */}
                  <Textarea 
                    id="templateContent" 
                    placeholder="Type your prompt template here. Use {{variable}} for dynamic fields..." 
                    className="font-mono text-sm leading-relaxed flex-1 min-h-[450px]"
                    value={templateContent}
                    onChange={(e) => setTemplateContent(e.target.value)}
                    required
                  />

                  {/* แสดง panel ตัวแปรที่ detect ได้ (เฉพาะเมื่อมีตัวแปร) */}
                  {variables.length > 0 && (
                    <div className="bg-primary/[0.04] rounded-xl border border-primary/20 p-5 flex flex-col gap-5">
                      <div className="flex items-center gap-2 font-semibold text-base text-primary">
                        <Sparkles className="h-5 w-5" /> Detected Variables ({variables.length})
                      </div>
                      <div className="flex flex-col gap-4">
                        {/* แสดง config ของแต่ละตัวแปร */}
                        {variables.map((v, idx) => (
                          <div key={idx} className="bg-background/60 p-3 rounded-xl border border-primary/10 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/30">
                            <div className="grid grid-cols-[1fr_2fr] gap-4 items-start">
                              <div>
                                <div className="font-mono text-sm font-bold text-primary mb-2 truncate" title={v.name}>
                                  {"{{"}{v.name.length > 22 ? v.name.substring(0, 18) + "..." : v.name}{"}}"}
                                </div>
                                {/* Dropdown เลือก type ของตัวแปร */}
                                <select
                                  className="w-full text-xs h-8 rounded-md border border-input bg-background px-2"
                                  value={v.type}
                                  onChange={(e) => updateVariable(v.name, "type", e.target.value)}
                                >
                                  <option value="TEXT">Text (TEXT)</option>
                                  <option value="TEXTAREA">Long Text (TEXTAREA)</option>
                                  <option value="SELECT">Select / Dropdown (SELECT)</option>
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

                            {/* Options editor (เฉพาะ type === "SELECT") */}
                            {v.type === "SELECT" && (
                              <div className="mt-3 pt-3 border-t border-primary/10">
                                <div className="flex items-center justify-between mb-2">
                                  <Label className="text-xs font-semibold text-foreground/80">
                                    Options <span className="text-muted-foreground font-normal">(คั่นด้วย , หรือกด Enter)</span>
                                  </Label>
                                  <span className="text-[10px] text-muted-foreground">
                                    {v.options.length} item{v.options.length !== 1 ? "s" : ""}
                                  </span>
                                </div>
                                <Input
                                  placeholder="พิมพ์ตัวเลือก แล้วกด Enter (เช่น TH, EN, JP)"
                                  className="h-8 text-xs"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      const target = e.currentTarget;
                                      addVariableOption(v.name, target.value);
                                      target.value = "";
                                    }
                                  }}
                                />
                                {v.options.length > 0 ? (
                                  <div className="flex flex-wrap gap-1.5 mt-2">
                                    {v.options.map((opt) => (
                                      <span
                                        key={opt}
                                        className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-xs text-primary transition-all duration-300 ease-in-out hover:scale-105"
                                      >
                                        {opt}
                                        <button
                                          type="button"
                                          aria-label={`Remove ${opt}`}
                                          onClick={() => removeVariableOption(v.name, opt)}
                                          className="hover:bg-primary/20 rounded-sm p-0.5 transition-colors"
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-[11px] text-muted-foreground mt-2 italic">
                                    ยังไม่มีตัวเลือก — เพิ่มอย่างน้อย 1 ตัวเลือก
                                  </p>
                                )}
                              </div>
                            )}
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
