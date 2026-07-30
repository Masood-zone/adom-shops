import { z } from "zod";

import { stockMovementTypes } from "../../db/schema/index.js";

const optionalDate = z.preprocess(
  (value) => {
    if (value === "" || value === undefined || value === null) {
      return undefined;
    }

    return value;
  },
  z.coerce.date().optional(),
);

export const stockAdjustmentSchema = z.object({
  productId: z.coerce
    .number()
    .int()
    .positive("Product ID must be positive"),

  type: z.enum([
    "RESTOCK",
    "ADJUSTMENT_IN",
    "ADJUSTMENT_OUT",
  ]),

  quantity: z.coerce
    .number()
    .int()
    .positive("Quantity must be greater than zero"),

  reason: z
    .string()
    .trim()
    .min(3, "Reason must contain at least 3 characters")
    .max(255, "Reason cannot exceed 255 characters"),
});

export const stockMovementQuerySchema = z
  .object({
    productId: z.coerce
      .number()
      .int()
      .positive()
      .optional(),

    type: z.enum(stockMovementTypes).optional(),

    from: optionalDate,
    to: optionalDate,

    page: z.coerce
      .number()
      .int()
      .positive()
      .default(1),

    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(20),
  })
  .superRefine((value, context) => {
    if (value.from && value.to && value.from > value.to) {
      context.addIssue({
        code: "custom",
        path: ["to"],
        message: "The end date cannot be before the start date",
      });
    }
  });

export type StockAdjustmentInput = z.infer<
  typeof stockAdjustmentSchema
>;

export type StockMovementQuery = z.infer<
  typeof stockMovementQuerySchema
>;
