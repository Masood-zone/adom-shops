import { decimal, index, int, mysqlTable } from "drizzle-orm/mysql-core";

import { products } from "./products.js";
import { sales } from "./sales.js";

export const saleItems = mysqlTable(
  "sale_items",
  {
    id: int("id").autoincrement().primaryKey(),

    saleId: int("sale_id")
      .notNull()
      .references(() => sales.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    productId: int("product_id")
      .notNull()
      .references(() => products.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),

    quantity: int("quantity").notNull(),

    unitPrice: decimal("unit_price", {
      precision: 12,
      scale: 2,
    }).notNull(),

    lineTotal: decimal("line_total", {
      precision: 12,
      scale: 2,
    }).notNull(),
  },

  (table) => [
    index("sale_items_sale_id_idx").on(table.saleId),

    index("sale_items_product_id_idx").on(table.productId),
  ],
);

export type SaleItem = typeof saleItems.$inferSelect;
export type NewSaleItem = typeof saleItems.$inferInsert;
