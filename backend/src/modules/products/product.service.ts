import { eq } from "drizzle-orm";

import { AppError } from "../../common/errors/app-error.js";
import { db } from "../../db/index.js";
import {
  categories,
  products,
  stockMovements,
} from "../../db/schema/index.js";

import * as productRepository from "./product.repository.js";

import type {
  CreateProductInput,
  ProductQuery,
  UpdateProductInput,
} from "./product.validation.js";

export function getProducts(query: ProductQuery) {
  return productRepository.listProducts(query);
}

export async function getProduct(id: number) {
  const product = await productRepository.findById(id);

  if (!product) {
    throw new AppError(404, "Product not found");
  }

  return product;
}

export async function createProduct(input: CreateProductInput) {
  const inserted = await db.transaction(async (tx) => {
    const [category] = await tx
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.id, input.categoryId))
      .limit(1);

    if (!category) {
      throw new AppError(400, "Category does not exist");
    }

    const [duplicate] = await tx
      .select({ id: products.id })
      .from(products)
      .where(eq(products.sku, input.sku))
      .limit(1);

    if (duplicate) {
      throw new AppError(409, "A product with this SKU already exists");
    }

    const [created] = await tx
      .insert(products)
      .values({
        categoryId: input.categoryId,
        sku: input.sku,
        name: input.name,
        description: input.description ?? null,
        unitPrice: input.unitPrice,
        quantityInStock: input.openingStock,
        reorderLevel: input.reorderLevel,
        isActive: input.isActive,
      })
      .$returningId();

    if (!created) {
      throw new AppError(500, "Product could not be created");
    }

    if (input.openingStock > 0) {
      await tx.insert(stockMovements).values({
        productId: created.id,
        type: "OPENING_STOCK",
        quantity: input.openingStock,
        previousStock: 0,
        newStock: input.openingStock,
        reason: "Opening stock",
      });
    }

    return created;
  });

  return getProduct(inserted.id);
}

export async function updateProduct(
  id: number,
  input: UpdateProductInput,
) {
  const current = await productRepository.findRawById(id);

  if (!current) {
    throw new AppError(404, "Product not found");
  }

  if (input.categoryId !== undefined) {
    const [category] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.id, input.categoryId))
      .limit(1);

    if (!category) {
      throw new AppError(400, "Category does not exist");
    }
  }

  if (input.sku !== undefined) {
    const duplicate = await productRepository.findBySku(input.sku);

    if (duplicate && duplicate.id !== id) {
      throw new AppError(409, "A product with this SKU already exists");
    }
  }

  const updated = await productRepository.update(id, {
    ...input,
    description:
      input.description === undefined ? undefined : input.description,
  });

  if (!updated) {
    throw new AppError(500, "Product could not be updated");
  }

  return updated;
}

export async function deactivateProduct(id: number) {
  const current = await productRepository.findRawById(id);

  if (!current) {
    throw new AppError(404, "Product not found");
  }

  await productRepository.deactivate(id);
}
