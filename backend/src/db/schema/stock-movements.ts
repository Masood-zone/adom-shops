import {
  index,
  int,
  mysqlEnum,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

import { products } from "./products.js";

export const stockMovementTypes = [
  "OPENING_STOCK",
  "RESTOCK",
  "ADJUSTMENT_IN",
  "ADJUSTMENT_OUT",
  "SALE",
  "SALE_VOID",
] as const;

export const stockMovements = mysqlTable(
  "stock_movements",
  {
    id: int("id").autoincrement().primaryKey(),

    productId: int("product_id")
      .notNull()
      .references(() => products.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),

    type: mysqlEnum("type", stockMovementTypes).notNull(),

    quantity: int("quantity").notNull(),

    previousStock: int("previous_stock").notNull(),

    newStock: int("new_stock").notNull(),

    reason: varchar("reason", {
      length: 255,
    }),

    referenceNumber: varchar("reference_number", {
      length: 100,
    }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },

  (table) => [
    index("stock_movements_product_id_idx").on(table.productId),

    index("stock_movements_type_idx").on(table.type),

    index("stock_movements_created_at_idx").on(table.createdAt),
  ],
);

export type StockMovement = typeof stockMovements.$inferSelect;

export type NewStockMovement = typeof stockMovements.$inferInsert;
