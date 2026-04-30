"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Check, Copy, Play } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/component/ui/card";
import { Button } from "@/component/ui/button";
import { Input } from "@/component/ui/input";
import { Textarea } from "@/component/ui/textarea";
import { Skeleton } from "@/component/ui/skeleton";

type VariableInfo = {
  id: number;
  name: string;
  type: string;
  description: string | null;
};

function PlaygroundContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const promptId = searchParams.get("promptId");
  const versionId = searchParams.get("versionId");

  const [publicPrompts, setPublicPrompts] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState("");
  const [variables, setVariables] = useState<VariableInfo[]>([]);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [runValues, setRunValues] = useState<Record<string, string>>({});
  const [currentVersionId, setCurrentVersionId] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!promptId) return;

    const fetchPrompt = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/prompts/${promptId}`);
        const promptData = res.data;
        
        let targetVersion = promptData.versions?.[0];
        if (versionId) {
          const found = promptData.versions?.find((v: any) => v.id === Number(versionId));
          if (found) targetVersion = found;
        }

        if (targetVersion) {
          setTemplate(targetVersion.template_content || "");
          setVariables(targetVersion.promptVariables || []);
          setCurrentVersionId(targetVersion.id);
          
          // Initialize values to empty string
          const initialVals: Record<string, string> = {};
          (targetVersion.promptVariables || []).forEach((v: VariableInfo) => {
            initialVals[v.name] = "";
          });
          setVariableValues(initialVals);
          setRunValues(initialVals);
        }
      } catch (error) {
        console.error("Error loading prompt:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrompt();
  }, [promptId, versionId]);

  useEffect(() => {
    if (promptId) return;
    
    const fetchPublicPrompts = async () => {
      setLoadingList(true);
      try {
        const res = await axios.get("/api/prompts?visibility=PUBLIC&status=PUBLISHED&limit=20");
        setPublicPrompts(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch public prompts:", err);
      } finally {
        setLoadingList(false);
      }
    };
    
    fetchPublicPrompts();
  }, [promptId]);

  // Regex matches {{variableName}} 
  const renderedPrompt = template.replace(/\{\{([^}]+)\}\}/g, (match, varName) => {
    const trimmedName = varName.trim();
    return runValues[trimmedName] !== undefined && runValues[trimmedName] !== "" 
      ? runValues[trimmedName] 
      : match;
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(renderedPrompt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleRunPrompt = async () => {
    setIsRunning(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRunValues(variableValues);

    if (promptId && currentVersionId) {
      const newRenderedPrompt = template.replace(/\{\{([^}]+)\}\}/g, (match, varName) => {
        const trimmedName = varName.trim();
        return variableValues[trimmedName] !== undefined && variableValues[trimmedName] !== "" 
          ? variableValues[trimmedName] 
          : match;
      });

      try {
        await axios.post("/api/playground", {
          promptId: Number(promptId),
          versionId: currentVersionId,
          rendered_prompt: newRenderedPrompt,
          variables_input: variableValues,
        });
        toast.success("บันทึกประวัติการทดสอบเรียบร้อยแล้ว");
      } catch (err) {
        console.error("Failed to save run history:", err);
        toast.error("เกิดข้อผิดพลาดในการบันทึกประวัติ");
      }
    }
    setIsRunning(false);
  };

  if (!promptId) {
    return (
      <div className="pb-20 max-w-6xl mx-auto space-y-6 pt-4 px-4 fade-in-up">
        <div className="text-center mb-10 pt-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2" >Prompt Playground</h1>
          
        </div>
        
        {loadingList ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-xl" />
             ))}
          </div>
        ) : publicPrompts.length === 0 ? (
          <div className="text-center py-20 border rounded-xl bg-card/50 border-dashed">
            <p className="text-muted-foreground">ไม่พบ Public Prompt ในขณะนี้</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicPrompts.map(p => (
              <Card 
                key={p.id} 
                className="hover:border-primary/50 cursor-pointer transition-all hover:shadow-md bg-card" 
                onClick={() => router.push(`/playground?promptId=${p.id}`)}
              >
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-1 text-foreground">{p.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">{p.description || "ไม่มีรายละเอียด"}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="pb-20 max-w-6xl mx-auto space-y-6 pt-4 fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-slate-800" style={{ color: "#000000ff" }}>Prompt Playground</h1>
        <p className="text-muted-foreground">ทดลองกรอกตัวแปรและดูผลลัพธ์ก่อนใช้งานจริง</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Side: Variables */}
        <Card className="shadow-sm flex flex-col h-full">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Variables</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2 flex-1 flex flex-col">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : variables.length === 0 ? (
              <div className="bg-muted/50 border border-border border-dashed rounded-lg flex items-center justify-center h-40 text-muted-foreground text-sm">
                ไม่มีตัวแปรสำหรับ Prompt พิมพ์คำตอบเพื่อใช้งานปกติ
              </div>
            ) : (
              <div className="space-y-3 flex-1 overflow-auto px-1">
                {variables.map((v) => {
                  const isMultiline = v.type?.toLowerCase() === "textarea" || v.name.toLowerCase().includes("content");
                  return (
                    <div key={v.id} className="flex flex-col">
                      {isMultiline ? (
                        <Textarea
                          placeholder={v.name}
                          className="min-h-[200px] resize-y bg-background focus-visible:ring-primary"
                          value={variableValues[v.name] || ""}
                          onChange={(e) => setVariableValues(prev => ({ ...prev, [v.name]: e.target.value }))}
                        />
                      ) : (
                        <Input
                          placeholder={v.name}
                          className="h-11 bg-background focus-visible:ring-primary"
                          value={variableValues[v.name] || ""}
                          onChange={(e) => setVariableValues(prev => ({ ...prev, [v.name]: e.target.value }))}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-4 mt-auto">
              <Button 
                className="w-full text-md font-semibold h-12" 
                size="lg" 
                onClick={handleRunPrompt}
                disabled={isRunning}
              >
                {isRunning ? "Running..." : "Run Prompt"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Side: Rendered Prompt */}
        <Card className="shadow-sm flex flex-col h-full min-h-[500px]">
          <CardHeader className="pb-4">
            <div className="flex flex-row items-center justify-between w-full relative">
               <CardTitle className="text-base">Rendered Prompt</CardTitle>
               
               <Button
                 variant="ghost"
                 size="icon"
                 className="absolute -top-1 -right-2 h-8 w-8 text-muted-foreground transition-colors"
                 onClick={handleCopy}
                 title="Copy Rendered Prompt"
               >
                 {isCopied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
               </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 relative">
            {loading ? (
               <div className="p-6">
                  <Skeleton className="h-4 w-full mb-3" />
                  <Skeleton className="h-4 w-[90%] mb-3" />
                  <Skeleton className="h-4 w-[95%] mb-3" />
                  <Skeleton className="h-4 w-3/4 mb-3" />
               </div>
            ) : (
               <div className="absolute inset-x-4 top-0 bottom-4 overflow-auto rounded-lg bg-muted/50 border px-4 py-4 text-sm whitespace-pre-wrap leading-relaxed">
                 {renderedPrompt || <span className="text-muted-foreground italic font-mono text-xs">final prompt preview...</span>}
               </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * หน้า Playground
 * โค้ดส่วนหลักหุ้มด้วย Suspense เพื่อรองรับการอ่านค่าจาก searchParams
 */
export default function PlaygroundPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-10"><Skeleton className="h-10 w-48" /></div>}>
      <PlaygroundContent />
    </Suspense>
  );
}
