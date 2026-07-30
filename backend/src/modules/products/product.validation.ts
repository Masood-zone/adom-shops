import { Decimal } from "decimal.js";
import { z } from "zod";

const booleanQuery = z
  .enum(["true", "false"])
  .transform((value) => value === "true")
  .optional();

const moneySchema = z
  .union([z.string(), z.number()])
  .transform((value) => String(value).trim())
  .refine((value) => /^\d{1,8}(\.\d{1,2})?$/.test(value), {
    message: "Unit price must be a positive amount with at most 2 decimal places",
  })
  .refine((value) => new Decimal(value).greaterThan(0), {
    message: "Unit price must be greater than zero",
  })
  .transform((value) => new Decimal(value).toFixed(2));

const productFields = {
  categoryId: z.coerce
    .number()
    .int()
    .positive("Category ID must be positive"),

  sku: z
    .string()
    .trim()
    .min(1, "SKU is required")
    .max(50, "SKU cannot exceed 50 characters")
    .transform((value) => value.toUpperCase()),

  name: z
    .string()
    .trim()
    .min(2, "Product name must have at least 2 characters")
    .max(150, "Product name cannot exceed 150 characters"),

  description: z
    .string()
    .trim()
    .max(65_535, "Description is too long")
    .nullable()
    .optional(),

  unitPrice: moneySchema,

  reorderLevel: z.coerce.number().int().min(0),

  isActive: z.boolean(),
};

export const productIdSchema = z.object({
  id: z.coerce.number().int().positive("Product ID must be positive"),
});

export const createProductSchema = z.object({
  ...productFields,
  reorderLevel: productFields.reorderLevel.default(5),
  isActive: productFields.isActive.default(true),
  openingStock: z.coerce.number().int().min(0).default(0),
});

export const updateProductSchema = z
  .object(productFields)
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one product field to update",
  });

export const productQuerySchema = z.object({
  search: z.string().trim().max(150).optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  isActive: booleanQuery,
  lowStock: booleanQuery,
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
