import { z } from "zod";

export const categoryIdSchema = z.object({
  id: z.coerce.number().int().positive("Category ID must be positive"),
});

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must have at least 2 characters")
    .max(100, "Category name cannot exceed 100 characters"),

  description: z
    .string()
    .trim()
    .max(255, "Description cannot exceed 255 characters")
    .nullable()
    .optional(),
});

export const updateCategorySchema = createCategorySchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one category field to update",
  });

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
