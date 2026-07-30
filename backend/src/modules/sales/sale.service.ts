import { randomUUID } from "node:crypto";

import { Decimal } from "decimal.js";
import { eq } from "drizzle-orm";

import { AppError } from "../../common/errors/app-error.js";
import { db } from "../../db/index.js";
import {
  products,
  saleItems,
  sales,
  stockMovements,
} from "../../db/schema/index.js";

import * as saleRepository from "./sale.repository.js";

import type {
  CreateSaleInput,
  SaleQuery,
  VoidSaleInput,
} from "./sale.validation.js";

function createSaleNumber(): string {
  const date = new Date()
    .toISOString()
    .slice(0, 10)
    .replaceAll("-", "");

  const suffix = randomUUID()
    .replaceAll("-", "")
    .slice(0, 8)
    .toUpperCase();

  return `ADS-${date}-${suffix}`;
}

export async function getSales(
  query: SaleQuery,
) {
  return saleRepository.listSales(query);
}

export async function getSale(id: number) {
  const sale = await saleRepository.findSaleById(id);

  if (!sale) {
    throw new AppError(404, "Sale not found");
  }

  return sale;
}

export async function createSale(
  input: CreateSaleInput,
) {
  const created = await db.transaction(
    async (tx) => {
      const preparedItems: Array<{
        product: typeof products.$inferSelect;
        quantity: number;
        lineTotal: string;
      }> = [];

      let totalAmount = new Decimal(0);

      const requestedItems = [...input.items].sort(
        (left, right) =>
          left.productId - right.productId,
      );

      for (const requestedItem of requestedItems) {
        const [product] = await tx
          .select()
          .from(products)
          .where(
            eq(
              products.id,
              requestedItem.productId,
            ),
          )
          .limit(1)
          .for("update");

        if (!product) {
          throw new AppError(
            404,
            `Product ${requestedItem.productId} was not found`,
          );
        }

        if (!product.isActive) {
          throw new AppError(
            400,
            `${product.name} is inactive`,
          );
        }

        if (
          product.quantityInStock <
          requestedItem.quantity
        ) {
          throw new AppError(
            400,
            `Insufficient stock for ${product.name}`,
            {
              availableStock:
                product.quantityInStock,
              requestedQuantity:
                requestedItem.quantity,
            },
          );
        }

        const lineTotal = new Decimal(
          product.unitPrice,
        ).times(requestedItem.quantity);

        totalAmount =
          totalAmount.plus(lineTotal);

        preparedItems.push({
          product,
          quantity: requestedItem.quantity,
          lineTotal: lineTotal.toFixed(2),
        });
      }

      const saleNumber = createSaleNumber();

      const [insertedSale] = await tx
        .insert(sales)
        .values({
          saleNumber,
          totalAmount: totalAmount.toFixed(2),
          notes: input.notes ?? null,
        })
        .$returningId();

      if (!insertedSale) {
        throw new AppError(
          500,
          "Sale could not be created",
        );
      }

      await tx
        .insert(saleItems)
        .values(
          preparedItems.map((item) => ({
            saleId: insertedSale.id,
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: item.product.unitPrice,
            lineTotal: item.lineTotal,
          })),
        );

      for (const item of preparedItems) {
        const newStock =
          item.product.quantityInStock -
          item.quantity;

        await tx
          .update(products)
          .set({
            quantityInStock: newStock,
          })
          .where(
            eq(products.id, item.product.id),
          );

        await tx
          .insert(stockMovements)
          .values({
            productId: item.product.id,
            type: "SALE",
            quantity: item.quantity,
            previousStock:
              item.product.quantityInStock,
            newStock,
            reason: `Sale ${saleNumber}`,
            referenceNumber: saleNumber,
          });
      }

      return {
        id: insertedSale.id,
        saleNumber,
      };
    },
    {
      isolationLevel: "serializable",
      accessMode: "read write",
    },
  );

  return getSale(created.id);
}

export async function voidSale(
  id: number,
  input: VoidSaleInput,
) {
  await db.transaction(
    async (tx) => {
      const [sale] = await tx
        .select()
        .from(sales)
        .where(eq(sales.id, id))
        .limit(1)
        .for("update");

      if (!sale) {
        throw new AppError(404, "Sale not found");
      }

      if (sale.status === "VOIDED") {
        throw new AppError(
          409,
          "This sale has already been voided",
        );
      }

      const items = await tx
        .select()
        .from(saleItems)
        .where(eq(saleItems.saleId, sale.id));

      if (items.length === 0) {
        throw new AppError(
          409,
          "The sale has no items to restore",
        );
      }

      const orderedItems = [...items].sort(
        (left, right) => left.productId - right.productId,
      );

      for (const item of orderedItems) {
        const [product] = await tx
          .select()
          .from(products)
          .where(eq(products.id, item.productId))
          .limit(1)
          .for("update");

        if (!product) {
          throw new AppError(
            409,
            `Product ${item.productId} no longer exists`,
          );
        }

        const newStock =
          product.quantityInStock + item.quantity;

        await tx
          .update(products)
          .set({
            quantityInStock: newStock,
          })
          .where(eq(products.id, product.id));

        await tx
          .insert(stockMovements)
          .values({
            productId: product.id,
            type: "SALE_VOID",
            quantity: item.quantity,
            previousStock:
              product.quantityInStock,
            newStock,
            reason: input.reason,
            referenceNumber: sale.saleNumber,
          });
      }

      await tx
        .update(sales)
        .set({
          status: "VOIDED",
          voidedAt: new Date(),
          voidReason: input.reason,
        })
        .where(eq(sales.id, sale.id));
    },
    {
      isolationLevel: "serializable",
      accessMode: "read write",
    },
  );

  return getSale(id);
}

export function getReceipt(id: number) {
  return getSale(id);
}
