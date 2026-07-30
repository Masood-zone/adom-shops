import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  lte,
  sql,
  type SQL,
} from "drizzle-orm";

import { endOfDay, startOfDay } from "../../common/utils/date-range.js";
import { createPaginationMeta } from "../../common/utils/pagination.js";
import { db } from "../../db/index.js";
import {
  categories,
  products,
  saleItems,
  sales,
  stockMovements,
} from "../../db/schema/index.js";

import type {
  InventoryValueQuery,
  LowStockReportQuery,
  SalesReportQuery,
  StockMovementReportQuery,
  TopProductsQuery,
} from "./report.validation.js";

function buildCompletedSaleConditions(
  query: SalesReportQuery,
): SQL[] {
  const conditions: SQL[] = [
    eq(sales.status, "COMPLETED"),
  ];

  if (query.from) {
    conditions.push(
      gte(sales.soldAt, startOfDay(query.from)),
    );
  }

  if (query.to) {
    conditions.push(
      lte(sales.soldAt, endOfDay(query.to)),
    );
  }

  return conditions;
}

export async function getSalesSummary(
  query: SalesReportQuery,
) {
  const [result] = await db
    .select({
      totalSales: count(),

      totalRevenue: sql<string>`
        coalesce(sum(${sales.totalAmount}), 0)
      `,

      averageSaleValue: sql<string>`
        coalesce(avg(${sales.totalAmount}), 0)
      `,
    })
    .from(sales)
    .where(
      and(
        ...buildCompletedSaleConditions(query),
      ),
    );

  return {
    totalSales: result?.totalSales ?? 0,
    totalRevenue: String(
      result?.totalRevenue ?? "0.00",
    ),
    averageSaleValue: String(
      result?.averageSaleValue ?? "0.00",
    ),
  };
}

export async function getSalesByDate(
  query: SalesReportQuery,
) {
  const saleDate = sql<string>`
    date_format(${sales.soldAt}, '%Y-%m-%d')
  `;

  return db
    .select({
      date: saleDate,

      totalSales: count(),

      revenue: sql<string>`
        coalesce(sum(${sales.totalAmount}), 0)
      `,
    })
    .from(sales)
    .where(
      and(
        ...buildCompletedSaleConditions(query),
      ),
    )
    .groupBy(saleDate)
    .orderBy(asc(saleDate));
}

export async function getTopProducts(
  query: TopProductsQuery,
) {
  return db
    .select({
      productId: products.id,
      sku: products.sku,
      name: products.name,

      quantitySold: sql<number>`
        coalesce(sum(${saleItems.quantity}), 0)
      `.mapWith(Number),

      revenue: sql<string>`
        coalesce(sum(${saleItems.lineTotal}), 0)
      `,
    })
    .from(saleItems)
    .innerJoin(
      sales,
      eq(saleItems.saleId, sales.id),
    )
    .innerJoin(
      products,
      eq(saleItems.productId, products.id),
    )
    .where(
      and(
        ...buildCompletedSaleConditions(query),
      ),
    )
    .groupBy(
      products.id,
      products.sku,
      products.name,
    )
    .orderBy(
      desc(
        sql`sum(${saleItems.quantity})`,
      ),
      asc(products.name),
    )
    .limit(query.limit);
}

export async function getLowStockReport(
  query: LowStockReportQuery,
) {
  const condition = and(
    eq(products.isActive, true),
    lte(
      products.quantityInStock,
      products.reorderLevel,
    ),
  );

  const offset = (query.page - 1) * query.limit;

  const [items, totalRows] = await Promise.all([
    db
      .select({
        productId: products.id,
        sku: products.sku,
        name: products.name,
        categoryId: categories.id,
        categoryName: categories.name,
        quantityInStock:
          products.quantityInStock,
        reorderLevel: products.reorderLevel,

        shortage: sql<number>`
          greatest(
            ${products.reorderLevel}
              - ${products.quantityInStock},
            0
          )
        `.mapWith(Number),
      })
      .from(products)
      .innerJoin(
        categories,
        eq(products.categoryId, categories.id),
      )
      .where(condition)
      .orderBy(
        products.quantityInStock,
        products.name,
      )
      .limit(query.limit)
      .offset(offset),

    db
      .select({ value: count() })
      .from(products)
      .where(condition),
  ]);

  const total = totalRows[0]?.value ?? 0;

  return {
    items,
    pagination: createPaginationMeta(
      query.page,
      query.limit,
      total,
    ),
  };
}

export async function getInventoryValue(
  query: InventoryValueQuery,
) {
  const conditions: SQL[] = [
    eq(products.isActive, true),
  ];

  if (query.categoryId) {
    conditions.push(
      eq(products.categoryId, query.categoryId),
    );
  }

  const [result] = await db
    .select({
      totalProducts: count(),

      totalUnits: sql<number>`
        coalesce(sum(${products.quantityInStock}), 0)
      `.mapWith(Number),

      inventoryValue: sql<string>`
        coalesce(
          sum(
            ${products.unitPrice}
              * ${products.quantityInStock}
          ),
          0
        )
      `,
    })
    .from(products)
    .where(and(...conditions));

  return {
    totalProducts:
      result?.totalProducts ?? 0,

    totalUnits:
      result?.totalUnits ?? 0,

    inventoryValue: String(
      result?.inventoryValue ?? "0.00",
    ),
  };
}

export async function getStockMovementReport(
  query: StockMovementReportQuery,
) {
  const conditions: SQL[] = [];

  if (query.productId) {
    conditions.push(
      eq(stockMovements.productId, query.productId),
    );
  }

  if (query.type) {
    conditions.push(
      eq(stockMovements.type, query.type),
    );
  }

  if (query.from) {
    conditions.push(
      gte(
        stockMovements.createdAt,
        startOfDay(query.from),
      ),
    );
  }

  if (query.to) {
    conditions.push(
      lte(
        stockMovements.createdAt,
        endOfDay(query.to),
      ),
    );
  }

  const whereClause =
    conditions.length > 0
      ? and(...conditions)
      : undefined;

  const offset = (query.page - 1) * query.limit;

  const [items, totalRows] = await Promise.all([
    db
      .select({
        id: stockMovements.id,
        productId: products.id,
        productSku: products.sku,
        productName: products.name,
        type: stockMovements.type,
        quantity: stockMovements.quantity,
        previousStock:
          stockMovements.previousStock,
        newStock: stockMovements.newStock,
        reason: stockMovements.reason,
        referenceNumber:
          stockMovements.referenceNumber,
        createdAt: stockMovements.createdAt,
      })
      .from(stockMovements)
      .innerJoin(
        products,
        eq(stockMovements.productId, products.id),
      )
      .where(whereClause)
      .orderBy(
        desc(stockMovements.createdAt),
        desc(stockMovements.id),
      )
      .limit(query.limit)
      .offset(offset),

    db
      .select({ value: count() })
      .from(stockMovements)
      .where(whereClause),
  ]);

  const total = totalRows[0]?.value ?? 0;

  return {
    items,
    pagination: createPaginationMeta(
      query.page,
      query.limit,
      total,
    ),
  };
}


