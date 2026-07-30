import {
  and,
  count,
  desc,
  eq,
  gt,
  lte,
  sql,
} from "drizzle-orm";

import { db } from "../../db/index.js";
import {
  categories,
  products,
  saleItems,
  sales,
} from "../../db/schema/index.js";

import type {
  DashboardSummaryQuery,
} from "./dashboard.validation.js";

export async function getSummary(
  query: DashboardSummaryQuery,
) {
  const completedToday = and(
    eq(sales.status, "COMPLETED"),
    sql`date(${sales.soldAt}) = current_date`,
  );

  const [
    categoryRows,
    productRows,
    activeProductRows,
    lowStockRows,
    outOfStockRows,
    todaySalesRows,
    recentSales,
    lowStockItems,
  ] = await Promise.all([
    db
      .select({ value: count() })
      .from(categories),

    db
      .select({ value: count() })
      .from(products),

    db
      .select({ value: count() })
      .from(products)
      .where(eq(products.isActive, true)),

    db
      .select({ value: count() })
      .from(products)
      .where(
        and(
          eq(products.isActive, true),
          gt(products.quantityInStock, 0),
          lte(
            products.quantityInStock,
            products.reorderLevel,
          ),
        ),
      ),

    db
      .select({ value: count() })
      .from(products)
      .where(
        and(
          eq(products.isActive, true),
          eq(products.quantityInStock, 0),
        ),
      ),

    db
      .select({
        salesCount: count(),
        revenue: sql<string>`
          coalesce(sum(${sales.totalAmount}), 0)
        `,
      })
      .from(sales)
      .where(completedToday),

    db
      .select({
        id: sales.id,
        saleNumber: sales.saleNumber,
        status: sales.status,
        totalAmount: sales.totalAmount,
        soldAt: sales.soldAt,

        totalUnits: sql<number>`
          coalesce(sum(${saleItems.quantity}), 0)
        `.mapWith(Number),
      })
      .from(sales)
      .leftJoin(
        saleItems,
        eq(sales.id, saleItems.saleId),
      )
      .groupBy(
        sales.id,
        sales.saleNumber,
        sales.status,
        sales.totalAmount,
        sales.soldAt,
      )
      .orderBy(
        desc(sales.soldAt),
        desc(sales.id),
      )
      .limit(query.recentSalesLimit),

    db
      .select({
        id: products.id,
        sku: products.sku,
        name: products.name,
        quantityInStock:
          products.quantityInStock,
        reorderLevel: products.reorderLevel,
      })
      .from(products)
      .where(
        and(
          eq(products.isActive, true),
          lte(
            products.quantityInStock,
            products.reorderLevel,
          ),
        ),
      )
      .orderBy(
        products.quantityInStock,
        products.name,
      )
      .limit(query.lowStockLimit),
  ]);

  const today = todaySalesRows[0];

  return {
    totalCategories:
      categoryRows[0]?.value ?? 0,

    totalProducts:
      productRows[0]?.value ?? 0,

    activeProducts:
      activeProductRows[0]?.value ?? 0,

    lowStockProducts:
      lowStockRows[0]?.value ?? 0,

    outOfStockProducts:
      outOfStockRows[0]?.value ?? 0,

    salesToday:
      today?.salesCount ?? 0,

    revenueToday:
      String(today?.revenue ?? "0.00"),

    recentSales,
    lowStockItems,
  };
}


