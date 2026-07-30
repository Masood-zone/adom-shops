import {
  and,
  asc,
  count,
  eq,
  gt,
  like,
  lte,
  or,
  type SQL,
} from "drizzle-orm";

import { createPaginationMeta } from "../../common/utils/pagination.js";
import { db } from "../../db/index.js";
import {
  categories,
  products,
  type NewProduct,
} from "../../db/schema/index.js";

import type {
  ProductQuery,
  UpdateProductInput,
} from "./product.validation.js";

function productSelection() {
  return {
    id: products.id,
    categoryId: products.categoryId,
    categoryName: categories.name,
    sku: products.sku,
    name: products.name,
    description: products.description,
    unitPrice: products.unitPrice,
    quantityInStock: products.quantityInStock,
    reorderLevel: products.reorderLevel,
    isActive: products.isActive,
    createdAt: products.createdAt,
    updatedAt: products.updatedAt,
  };
}

function shapeProduct<T extends { categoryId: number; categoryName: string }>(
  row: T,
) {
  const { categoryName, ...product } = row;

  return {
    ...product,
    category: {
      id: row.categoryId,
      name: categoryName,
    },
  };
}

export async function listProducts(query: ProductQuery) {
  const conditions: SQL[] = [];

  if (query.search) {
    const term = `%${query.search}%`;
    const searchCondition = or(
      like(products.name, term),
      like(products.sku, term),
    );

    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  if (query.categoryId) {
    conditions.push(eq(products.categoryId, query.categoryId));
  }

  if (query.isActive !== undefined) {
    conditions.push(eq(products.isActive, query.isActive));
  }

  if (query.lowStock !== undefined) {
    conditions.push(
      query.lowStock
        ? lte(products.quantityInStock, products.reorderLevel)
        : gt(products.quantityInStock, products.reorderLevel),
    );
  }

  const whereClause =
    conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (query.page - 1) * query.limit;

  const [rows, totalRows] = await Promise.all([
    db
      .select(productSelection())
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(whereClause)
      .orderBy(asc(products.name), asc(products.id))
      .limit(query.limit)
      .offset(offset),

    db
      .select({ value: count() })
      .from(products)
      .where(whereClause),
  ]);

  const total = totalRows[0]?.value ?? 0;

  return {
    items: rows.map(shapeProduct),
    pagination: createPaginationMeta(query.page, query.limit, total),
  };
}

export async function findById(id: number) {
  const [row] = await db
    .select(productSelection())
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.id, id))
    .limit(1);

  return row ? shapeProduct(row) : undefined;
}

export async function findRawById(id: number) {
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  return product;
}

export async function findBySku(sku: string) {
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.sku, sku))
    .limit(1);

  return product;
}

export async function update(id: number, values: UpdateProductInput) {
  await db.update(products).set(values).where(eq(products.id, id));

  return findById(id);
}

export async function deactivate(id: number) {
  await db
    .update(products)
    .set({ isActive: false })
    .where(eq(products.id, id));
}

export type ProductInsert = NewProduct;
