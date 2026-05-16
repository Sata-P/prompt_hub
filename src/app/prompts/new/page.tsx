"use client";

// หน้าสร้าง Prompt ใหม่ — เป็นเพียง wrapper ที่เรียก <PromptForm /> ที่ใช้ร่วมกับหน้า edit

import { useRouter } from "next/navigation";
import axios from "axios";
import { PromptForm, type PromptFormValues } from "@/component/prompts/PromptForm";

export default function CreatePromptPage() {
  const router = useRouter();

  const handleCreate = async (values: PromptFormValues) => {
    const payload = {
      title: values.title,
      description: values.description || undefined,
      categoryId: values.categoryId ? Number(values.categoryId) : undefined,
      recommendedModels: values.recommendedModels.length > 0 ? values.recommendedModels : undefined,
      tags: values.tags,
      templateContent: values.templateContent,
      variables:
        values.variables.length > 0
          ? values.variables.map(v => ({
              name: v.name,
              label: v.label || v.name,
              type: v.type,
              description: v.description || undefined,
              optionsJson: v.type === "SELECT" ? v.options : undefined,
            }))
          : undefined,
    };

    const res = await axios.post("/api/prompts", payload, { timeout: 30000 });
    router.push(`/prompts/${res.data.id}`);
  };

  return (
    <PromptForm
      mode="create"
      backHref="/prompts"
      backLabel="Back to Prompts"
      headerTitle={<>Create <span className="text-primary">New Prompt</span></>}
      submitLabel="Save Prompt"
      submitLoadingLabel="Saving..."
      onSubmit={handleCreate}
    />
  );
}
