import { z } from "zod";

export const CreateCollectionSchema = z.object({
    name: z.string().min(1, "Collection name is required"),
    description: z.string().optional(),
    visibility: z.enum(["PUBLIC", "PRIVATE"]).default("PRIVATE"),
});

export type CreateCollectionInput = z.infer<typeof CreateCollectionSchema>;

export const UpdateCollectionSchema = z.object({
    name: z.string().min(1, "Collection name is required").optional(),
    description: z.string().optional(),
    visibility: z.enum(["PUBLIC", "PRIVATE"]).default("PRIVATE").optional(),
});

export type UpdateCollectionSchema = z.infer<typeof UpdateCollectionSchema>;

