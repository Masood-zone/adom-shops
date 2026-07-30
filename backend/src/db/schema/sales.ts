import {
  decimal,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const saleStatuses = ["COMPLETED", "VOIDED"] as const;

export const sales = mysqlTable(
  "sales",
  {
    id: int("id").autoincrement().primaryKey(),

    saleNumber: varchar("sale_number", {
      length: 50,
    }).notNull(),

    status: mysqlEnum("status", saleStatuses).notNull().default("COMPLETED"),

    totalAmount: decimal("total_amount", {
      precision: 12,
      scale: 2,
    }).notNull(),

    notes: varchar("notes", {
      length: 255,
    }),

    soldAt: timestamp("sold_at").defaultNow().notNull(),

    voidedAt: timestamp("voided_at"),

    voidReason: varchar("void_reason", {
      length: 255,
    }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },

  (table) => [
    uniqueIndex("sales_sale_number_unique").on(table.saleNumber),

    index("sales_status_idx").on(table.status),

    index("sales_sold_at_idx").on(table.soldAt),
  ],
);

export type Sale = typeof sales.$inferSelect;
export type NewSale = typeof sales.$inferInsert;
