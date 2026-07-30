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

const dateRangeShape = {
  from: optionalDate,
  to: optionalDate,
};

function validateDateRange(
  value: {
    from?: Date;
    to?: Date;
  },
  context: z.RefinementCtx,
): void {
  if (value.from && value.to && value.from > value.to) {
    context.addIssue({
      code: "custom",
      path: ["to"],
      message: "The end date cannot be before the start date",
    });
  }
}

export const salesReportQuerySchema = z
  .object(dateRangeShape)
  .superRefine(validateDateRange);

export const topProductsQuerySchema = z
  .object({
    ...dateRangeShape,

    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(10),
  })
  .superRefine(validateDateRange);

export const lowStockReportQuerySchema =
  z.object({
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
  });

export const inventoryValueQuerySchema =
  z.object({
    categoryId: z.coerce
      .number()
      .int()
      .positive()
      .optional(),
  });

export const stockMovementReportQuerySchema = z
  .object({
    productId: z.coerce
      .number()
      .int()
      .positive()
      .optional(),

    type: z.enum(stockMovementTypes).optional(),

    ...dateRangeShape,

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
  .superRefine(validateDateRange);

export type SalesReportQuery = z.infer<
  typeof salesReportQuerySchema
>;

export type TopProductsQuery = z.infer<
  typeof topProductsQuerySchema
>;

export type LowStockReportQuery = z.infer<
  typeof lowStockReportQuerySchema
>;

export type InventoryValueQuery = z.infer<
  typeof inventoryValueQuerySchema
>;

export type StockMovementReportQuery = z.infer<
  typeof stockMovementReportQuerySchema
>;


