import { z } from "zod";

export const dashboardSummaryQuerySchema =
  z.object({
    recentSalesLimit: z.coerce
      .number()
      .int()
      .min(1)
      .max(20)
      .default(5),

    lowStockLimit: z.coerce
      .number()
      .int()
      .min(1)
      .max(20)
      .default(5),
  });

export type DashboardSummaryQuery = z.infer<
  typeof dashboardSummaryQuerySchema
>;

