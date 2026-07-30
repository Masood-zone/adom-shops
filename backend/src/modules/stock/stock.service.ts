import { eq } from "drizzle-orm";

import { AppError } from "../../common/errors/app-error.js";
import { db } from "../../db/index.js";
import {
  products,
  stockMovements,
} from "../../db/schema/index.js";

import * as stockRepository from "./stock.repository.js";

import type {
  StockAdjustmentInput,
  StockMovementQuery,
} from "./stock.validation.js";

export async function adjustStock(
  input: StockAdjustmentInput,
) {
  return db.transaction(
    async (tx) => {
      const [product] = await tx
        .select()
        .from(products)
        .where(eq(products.id, input.productId))
        .limit(1)
        .for("update");

      if (!product) {
        throw new AppError(404, "Product not found");
      }

      if (!product.isActive) {
        throw new AppError(
          400,
          "Stock cannot be adjusted for an inactive product",
        );
      }

      const increasesStock =
        input.type === "RESTOCK" ||
        input.type === "ADJUSTMENT_IN";

      const newStock = increasesStock
        ? product.quantityInStock + input.quantity
        : product.quantityInStock - input.quantity;

      if (newStock < 0) {
        throw new AppError(
          400,
          "Stock cannot be reduced below zero",
        );
      }

      await tx
        .update(products)
        .set({
          quantityInStock: newStock,
        })
        .where(eq(products.id, product.id));

      const [movementId] = await tx
        .insert(stockMovements)
        .values({
          productId: product.id,
          type: input.type,
          quantity: input.quantity,
          previousStock: product.quantityInStock,
          newStock,
          reason: input.reason,
        })
        .$returningId();

      return {
        movementId: movementId?.id,
        productId: product.id,
        productName: product.name,
        previousStock: product.quantityInStock,
        newStock,
      };
    },
  );
}

export function getStockMovements(
  query: StockMovementQuery,
) {
  return stockRepository.listMovements(query);
}
