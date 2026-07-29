import {
  int,
  mysqlTable,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const categories = mysqlTable(
  "categories",
  {
    id: int("id").autoincrement().primaryKey(),

    name: varchar("name", {
      length: 100,
    }).notNull(),

    description: varchar("description", {
      length: 255,
    }),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },

  (table) => [uniqueIndex("categories_name_unique").on(table.name)],
);

export type Category = typeof categories.$inferSelect;

export type NewCategory = typeof categories.$inferInsert;
