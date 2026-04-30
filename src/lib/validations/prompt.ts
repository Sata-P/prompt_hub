import { z } from "zod";

// ---------- Create Prompt ----------
export const CreatePromptSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be 255 characters or less"),
  description: z.string().optional(),
  categoryId: z.number().int().positive().optional().nullable(),
  recommendedModel: z.string().max(100).optional().nullable(),
  visibility: z.enum(["PRIVATE", "PUBLIC"]).optional(),
  tags: z.array(z.string().min(1).max(100)).optional(),
  // First version content
  templateContent: z
    .string()
    .min(1, "Template content is required"),
  systemPrompt: z.string().optional().nullable(),
  outputFormat: z.string().optional().nullable(),
  // Variables for the template
  variables: z
    .array(
      z.object({
        name: z
          .string()
          .min(1, "Variable name is required")
          .max(100)
          .regex(
            /^[a-zA-Z_][a-zA-Z0-9_]*$/,
            "Variable name must start with a letter or underscore"
          ),
        label: z.string().min(1).max(150),
        type: z.enum(["TEXT", "TEXTAREA", "SELECT", "NUMBER", "BOOLEAN"]),
        isRequired: z.boolean().optional(),
        defaultValue: z.string().optional().nullable(),
        placeholder: z.string().optional().nullable(),
        description: z.string().optional().nullable(),
        optionsJson: z.any().optional().nullable(),
        sortOrder: z.number().int().min(0).optional(),
      })
    )
    .optional(),
});

export type CreatePromptInput = z.infer<typeof CreatePromptSchema>;

// ---------- Update Prompt ----------
export const UpdatePromptSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255)
    .optional(),
  description: z.string().optional().nullable(),
  categoryId: z.number().int().positive().optional().nullable(),
  recommendedModel: z.string().max(100).optional().nullable(),
  visibility: z.enum(["PRIVATE", "PUBLIC"]).optional(),
  isTemplateActive: z.boolean().optional(),
  tags: z.array(z.string().min(1).max(100)).optional(),
});

export type UpdatePromptInput = z.infer<typeof UpdatePromptSchema>;

// ---------- Update Prompt Status ----------
const VALID_STATUSES = ["DRAFT", "REVIEW", "PUBLISHED", "REJECTED", "ARCHIVED"] as const;

export const UpdatePromptStatusSchema = z.object({
  status: z.enum(VALID_STATUSES),
});

export type UpdatePromptStatusInput = z.infer<typeof UpdatePromptStatusSchema>;
