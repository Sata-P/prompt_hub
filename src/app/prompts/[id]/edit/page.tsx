"use client";

// หน้าแก้ไข Prompt — โหลดข้อมูล prompt แล้วส่งเป็น initialValues ให้ <PromptForm />

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { ShieldAlert } from "lucide-react";

import { Button } from "@/component/ui/button";
import {
  PromptForm,
  type PromptFormValues,
  type VariableConfig,
  type VariableType,
  VARIABLE_TYPES,
} from "@/component/prompts/PromptForm";

type PromptVariable = {
  id: number;
  name: string;
  type: string;
  label: string | null;
  description: string | null;
  options_json: string[] | null;
};

type PromptDetail = {
  id: number;
  title: string;
  description: string | null;
  recommended_models: string[];
  category: { id: number; name: string } | null;
  tags: { id: number; name: string }[];
  versions: {
    id: number;
    version_no: number;
    template_content: string;
    promptVariables: PromptVariable[];
  }[];
};

function coerceVariableType(t: string): VariableType {
  return (VARIABLE_TYPES as readonly string[]).includes(t) ? (t as VariableType) : "TEXT";
}

export default function EditPromptPage() {
  const { id } = useParams();
  const router = useRouter();

  const [initialValues, setInitialValues] = useState<PromptFormValues | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!id) return;
    const ctrl = new AbortController();
    axios
      .get<PromptDetail>(`/api/prompts/${id}`, { signal: ctrl.signal })
      .then(res => {
        const prompt = res.data;
        const latestVer = prompt.versions?.[0];
        const variables: VariableConfig[] = (latestVer?.promptVariables ?? []).map(v => ({
          name: v.name,
          type: coerceVariableType(v.type),
          label: v.label || v.name,
          description: v.description || "",
          options: Array.isArray(v.options_json) ? v.options_json : [],
        }));

        setInitialValues({
          title: prompt.title,
          description: prompt.description || "",
          categoryId: prompt.category ? String(prompt.category.id) : "",
          tags: prompt.tags.map(t => t.name),
          templateContent: latestVer?.template_content ?? "",
          recommendedModels: prompt.recommended_models || [],
          variables,
        });
      })
      .catch(err => {
        if (axios.isCancel(err)) return;
        setLoadError(err?.response?.data?.error || "Failed to load prompt for editing");
      });
    return () => ctrl.abort();
  }, [id]);

  const handleUpdate = async (values: PromptFormValues) => {
    // 1) Patch prompt-level metadata
    await axios.patch(
      `/api/prompts/${id}`,
      {
        title: values.title,
        description: values.description || undefined,
        categoryId: values.categoryId ? Number(values.categoryId) : null,
        recommendedModels: values.recommendedModels.length > 0 ? values.recommendedModels : undefined,
        tags: values.tags,
      },
      { timeout: 30000 }
    );

    // 2) Post a new version (review/approval workflow)
    await axios.post(
      `/api/prompts/${id}/versions`,
      {
        templateContent: values.templateContent,
        variables: values.variables.map(v => ({
          name: v.name,
          type: v.type,
          label: v.label,
          description: v.description,
          optionsJson: v.options,
        })),
      },
      { timeout: 30000 }
    );

    router.push(`/prompts/${id}`);
  };

  if (loadError) {
    return (
      <div className="py-20 text-center max-w-lg mx-auto">
        <div className="bg-destructive/10 text-destructive p-6 rounded-lg mb-6">
          <ShieldAlert className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Unable to Edit Prompt</h2>
          <p>{loadError}</p>
        </div>
        <Button asChild>
          <Link href="/prompts">Back to Prompt Library</Link>
        </Button>
      </div>
    );
  }

  if (!initialValues) {
    return <div className="py-20 text-center text-muted-foreground">Loading prompt data...</div>;
  }

  return (
    <PromptForm
      mode="edit"
      initialValues={initialValues}
      backHref={`/prompts/${id}`}
      backLabel="Back to Prompt"
      headerTitle={<>Edit <span className="text-primary">Prompt</span></>}
      submitLabel="Save Changes"
      submitLoadingLabel="Saving..."
      onSubmit={handleUpdate}
    />
  );
}
