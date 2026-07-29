import { z } from "zod";

export const stockAdjustmentSchema = z.object({
  productId: z.coerce.number().int().positive(),

  type: z.enum(["RESTOCK", "ADJUSTMENT_IN", "ADJUSTMENT_OUT"]),

  quantity: z.coerce
    .number()
    .int()
    .positive("Quantity must be greater than zero"),

  reason: z.string().trim().min(3).max(255),
});

export const stockMovementQuerySchema = z.object({
  productId: z.coerce.number().int().positive().optional(),

  type: z
    .enum([
      "OPENING_STOCK",
      "RESTOCK",
      "ADJUSTMENT_IN",
      "ADJUSTMENT_OUT",
      "SALE",
      "SALE_VOID",
    ])
    .optional(),

  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>;
