import {
  and,
  count,
  desc,
  eq,
  gte,
  lte,
  type SQL,
} from "drizzle-orm";

import { endOfDay, startOfDay } from "../../common/utils/date-range.js";
import { createPaginationMeta } from "../../common/utils/pagination.js";
import { db } from "../../db/index.js";
import {
  products,
  stockMovements,
} from "../../db/schema/index.js";

import type { StockMovementQuery } from "./stock.validation.js";

export async function findProductById(id: number) {
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  return product;
}

export async function listMovements(
  query: StockMovementQuery,
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
        productId: stockMovements.productId,
        productName: products.name,
        productSku: products.sku,
        type: stockMovements.type,
        quantity: stockMovements.quantity,
        previousStock: stockMovements.previousStock,
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
      .select({
        value: count(),
      })
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
