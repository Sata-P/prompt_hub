import { z } from "zod";

export const CreateCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name must be 100 characters or less"),
  color: z
    .string()
    .max(30)
    .regex(/^#[0-9a-fA-F]{6}$/, "Color must be a valid hex color (e.g. #FF5733)")
    .optional()
    .nullable(),
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;

export const UpdateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  color: z
    .string()
    .max(30)
    .regex(/^#[0-9a-fA-F]{6}$/, "Color must be a valid hex color")
    .optional()
    .nullable(),
});

export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
