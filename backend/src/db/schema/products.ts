import {
  boolean,
  decimal,
  index,
  int,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

import { categories } from "./categories.js";

export const products = mysqlTable(
  "products",
  {
    id: int("id").autoincrement().primaryKey(),

    categoryId: int("category_id")
      .notNull()
      .references(() => categories.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),

    sku: varchar("sku", {
      length: 50,
    }).notNull(),

    name: varchar("name", {
      length: 150,
    }).notNull(),

    description: text("description"),

    unitPrice: decimal("unit_price", {
      precision: 10,
      scale: 2,
    }).notNull(),

    quantityInStock: int("quantity_in_stock").notNull().default(0),

    reorderLevel: int("reorder_level").notNull().default(5),

    isActive: boolean("is_active").notNull().default(true),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },

  (table) => [
    uniqueIndex("products_sku_unique").on(table.sku),

    index("products_category_id_index").on(table.categoryId),

    index("products_name_index").on(table.name),
  ],
);

export type Product = typeof products.$inferSelect;

export type NewProduct = typeof products.$inferInsert;
