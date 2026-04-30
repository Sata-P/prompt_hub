import { z } from "zod";

// ---------- Create Version ----------
export const CreateVersionSchema = z.object({
  templateContent: z
    .string()
    .min(1, "Template content is required"),
  systemPrompt: z.string().optional().nullable(),
  outputFormat: z.string().optional().nullable(),
  changelog: z.string().optional().nullable(),
  variables: z
    .array(
      z.object({
        name: z
          .string()
          .min(1)
          .max(100)
          .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/),
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

export type CreateVersionInput = z.infer<typeof CreateVersionSchema>;

// ---------- Update Version ----------
export const UpdateVersionSchema = z.object({
  templateContent: z.string().min(1).optional(),
  systemPrompt: z.string().optional().nullable(),
  outputFormat: z.string().optional().nullable(),
  changelog: z.string().optional().nullable(),
  variables: z
    .array(
      z.object({
        name: z.string().min(1).max(100).regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/),
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

export type UpdateVersionInput = z.infer<typeof UpdateVersionSchema>;
