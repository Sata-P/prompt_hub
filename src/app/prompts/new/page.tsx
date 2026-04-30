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

// Type สำหรับข้อมูลหมวดหมู่ที่ดึงมาจาก API
type Category = { id: number; name: string };

// Type สำหรับ config ของตัวแปรแต่ละตัวที่ตรวจพบใน template
type VariableConfig = {
  name: string;        // ชื่อตัวแปร (เช่น "topic")
  type: string;        // ประเภท input (TEXT, TEXTAREA, NUMBER, BOOLEAN)
  label: string;       // ชื่อที่แสดงให้ผู้ใช้เห็น
  description: string; // คำอธิบายเพิ่มเติม
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

  // โหลดหมวดหมู่จาก API ตอนที่ component mount
  useEffect(() => {
    axios.get<Category[]>("/api/categories")
      .then(res => setCategories(res.data || []))
      .catch(err => console.error("Failed to load categories:", err));
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
        return { name, type: "TEXT", label: name, description: "" };
      });
      return nextVars;
    });
  }, [templateContent]);

  // อัปเดต field ของตัวแปรตัวใดตัวหนึ่ง (type / label / description)
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
      setError("กรุณากรอกหัวข้อ และเนื้อหาของ Prompt");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        title,
        description: description || undefined,                      // optional
        categoryId: categoryId ? Number(categoryId) : undefined,    // optional
        tags,
        templateContent,
        variables: variables.length > 0 ? variables : undefined     // ส่งเฉพาะถ้ามีตัวแปร
      };

      const res = await axios.post("/api/prompts", payload);
      // redirect ไปหน้า detail ของ prompt ที่เพิ่งสร้าง
      router.push(`/prompts/${res.data.id}`);
    } catch (err: unknown) {
      // แสดง error message จาก API หรือ fallback message
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("ไม่สามารถสร้าง Prompt ได้ เกิดข้อผิดพลาด");
      }
      setLoading(false);
    }
  };

  return (
    <div className="pb-20">
      <main className="py-4">
        {/* ปุ่มย้อนกลับไปหน้า Prompts */}
        <Button variant="ghost" className="mb-6 -ml-4" asChild>
          <Link href="/prompts"><ArrowLeft className="mr-2 h-4 w-4" /> ย้อนกลับ (Back to Prompts)</Link>
        </Button>

        <form onSubmit={handleSubmit}>
          {/* Header: ชื่อหน้า + ปุ่ม submit */}
          <div className="flex flex-col md:flex-row items-start justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">สร้าง Prompt ใหม่</h1>
              <p className="text-muted-foreground mt-1">ตั้งค่าชื่อ และโครงสร้าง Prompt ให้พร้อมสำหรับการใช้งาน</p>
            </div>
            <Button type="submit" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? "กำลังบันทึก..." : "บันทึกและสร้าง"}
            </Button>
          </div>

          {/* Error message (แสดงเฉพาะเมื่อมี error) */}
          {error && (
             <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6 font-medium flex items-center gap-2">
               <ShieldAlert className="h-5 w-5" /> {error}
             </div>
          )}

          {/* Layout 2 คอลัมน์: ซ้าย = ข้อมูลทั่วไป, ขวา = template content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* คอลัมน์ซ้าย: ข้อมูลทั่วไป */}
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>ข้อมูลทั่วไป (General Info)</CardTitle>
                  <CardDescription>รายละเอียดพื้นฐานที่จะช่วยให้คุณจำได้ว่า Prompt นี้มีไว้ทำอะไร</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* ชื่อ Prompt (required) */}
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
                  
                  {/* รายละเอียด (optional) */}
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
                    {/* Dropdown เลือกหมวดหมู่ */}
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
                          {/* render ตัวเลือกหมวดหมู่ที่โหลดมา */}
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Tags input: กด Enter เพื่อเพิ่ม */}
                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags (พิมพ์แล้วกด Enter)</Label>
                      <Input 
                        id="tags" 
                        placeholder="เพิ่ม tag..." 
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                      />
                      {/* แสดง tag ที่เพิ่มแล้ว พร้อมปุ่มลบ */}
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

            {/* คอลัมน์ขวา: Template Content + ตัวแปร */}
            <div className="space-y-8">
              <Card className="flex flex-col h-full">
                <CardHeader>
                  <CardTitle>เนื้อหาคำสั่ง (Template Content)</CardTitle>
                  <CardDescription>รูปแบบคำสั่ง Prompt พร้อมใส่ตัวแปร (เช่น {"{{name}}"}, {"{{topic}}"})</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6 flex-1">
                  {/* Textarea สำหรับพิมพ์ template (required) */}
                  <Textarea 
                    id="templateContent" 
                    placeholder="พิมพ์ข้อความ prompt ของคุณที่นี่..." 
                    className="font-mono text-sm leading-relaxed flex-1 min-h-[250px]"
                    value={templateContent}
                    onChange={(e) => setTemplateContent(e.target.value)}
                    required
                  />

                  {/* แสดง panel ตัวแปรที่ detect ได้ (เฉพาะเมื่อมีตัวแปร) */}
                  {variables.length > 0 && (
                    <div className="bg-muted/30 rounded-lg border p-4 space-y-4">
                      <div className="flex items-center gap-2 font-semibold">
                        <Sparkles className="h-4 w-4 text-primary" /> ตัวแปรที่ตรวจพบ ({variables.length})
                      </div>
                      <div className="space-y-4">
                        {/* แสดง config ของแต่ละตัวแปร */}
                        {variables.map((v, idx) => (
                          <div key={idx} className="grid grid-cols-[1fr_2fr] gap-4 items-start border-l-2 border-primary/50 pl-3">
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
