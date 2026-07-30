import { z } from "zod";

const optionalDate = z.preprocess(
  (value) => {
    if (value === "" || value === undefined || value === null) {
      return undefined;
    }

    return value;
  },
  z.coerce.date().optional(),
);

export const saleIdSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive("Sale ID must be positive"),
});

export const createSaleSchema = z
  .object({
    items: z
      .array(
        z.object({
          productId: z.coerce
            .number()
            .int()
            .positive(),

          quantity: z.coerce
            .number()
            .int()
            .positive(
              "Quantity must be greater than zero",
            ),
        }),
      )
      .min(1, "A sale requires at least one item")
      .max(100, "A sale cannot exceed 100 line items"),

    notes: z
      .string()
      .trim()
      .max(255)
      .optional(),
  })
  .superRefine((value, context) => {
    const seen = new Set<number>();

    value.items.forEach((item, index) => {
      if (seen.has(item.productId)) {
        context.addIssue({
          code: "custom",
          path: ["items", index, "productId"],
          message:
            "The same product cannot appear twice in one sale",
        });
      }

      seen.add(item.productId);
    });
  });

export const saleQuerySchema = z
  .object({
    search: z
      .string()
      .trim()
      .max(50)
      .optional(),

    status: z
      .enum(["COMPLETED", "VOIDED"])
      .optional(),

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

export const voidSaleSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, "A void reason is required")
    .max(255),
});

export type CreateSaleInput = z.infer<
  typeof createSaleSchema
>;

export type SaleQuery = z.infer<
  typeof saleQuerySchema
>;

export type VoidSaleInput = z.infer<
  typeof voidSaleSchema
>;

