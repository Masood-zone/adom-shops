import {
  and,
  count,
  desc,
  eq,
  gte,
  like,
  lte,
  sql,
  type SQL,
} from "drizzle-orm";

import { endOfDay, startOfDay } from "../../common/utils/date-range.js";
import { createPaginationMeta } from "../../common/utils/pagination.js";
import { db } from "../../db/index.js";
import {
  products,
  saleItems,
  sales,
} from "../../db/schema/index.js";

import type { SaleQuery } from "./sale.validation.js";

export async function listSales(
  query: SaleQuery,
) {
  const conditions: SQL[] = [];

  if (query.search) {
    conditions.push(
      like(
        sales.saleNumber,
        `%${query.search}%`,
      ),
    );
  }

  if (query.status) {
    conditions.push(
      eq(sales.status, query.status),
    );
  }

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

  const whereClause =
    conditions.length > 0
      ? and(...conditions)
      : undefined;

  const offset = (query.page - 1) * query.limit;

  const [items, totalRows] = await Promise.all([
    db
      .select({
        id: sales.id,
        saleNumber: sales.saleNumber,
        status: sales.status,
        totalAmount: sales.totalAmount,
        notes: sales.notes,
        soldAt: sales.soldAt,
        voidedAt: sales.voidedAt,
        voidReason: sales.voidReason,

        totalUnits: sql<number>`
          coalesce(sum(${saleItems.quantity}), 0)
        `.mapWith(Number),
      })
      .from(sales)
      .leftJoin(
        saleItems,
        eq(sales.id, saleItems.saleId),
      )
      .where(whereClause)
      .groupBy(
        sales.id,
        sales.saleNumber,
        sales.status,
        sales.totalAmount,
        sales.notes,
        sales.soldAt,
        sales.voidedAt,
        sales.voidReason,
      )
      .orderBy(
        desc(sales.soldAt),
        desc(sales.id),
      )
      .limit(query.limit)
      .offset(offset),

    db
      .select({
        value: count(),
      })
      .from(sales)
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

export async function findSaleById(id: number) {
  const [sale] = await db
    .select()
    .from(sales)
    .where(eq(sales.id, id))
    .limit(1);

  if (!sale) {
    return undefined;
  }

  const items = await db
    .select({
      id: saleItems.id,
      productId: saleItems.productId,
      productName: products.name,
      productSku: products.sku,
      quantity: saleItems.quantity,
      unitPrice: saleItems.unitPrice,
      lineTotal: saleItems.lineTotal,
    })
    .from(saleItems)
    .innerJoin(
      products,
      eq(saleItems.productId, products.id),
    )
    .where(eq(saleItems.saleId, id))
    .orderBy(saleItems.id);

  return {
    ...sale,
    items,
  };
}


