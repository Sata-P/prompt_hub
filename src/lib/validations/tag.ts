import { z } from "zod";

export const CreateTagSchema = z.object({
  name: z
    .string()
    .min(1, "Tag name is required")
    .max(100, "Tag name must be 100 characters or less"),
});

export type CreateTagInput = z.infer<typeof CreateTagSchema>;
