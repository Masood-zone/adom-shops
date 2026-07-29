import { asc, eq } from "drizzle-orm";

import { db } from "../../db/index.js";
import { categories, type NewCategory } from "../../db/schema/index.js";

type CategoryUpdate = Partial<Pick<NewCategory, "name" | "description">>;

export async function findAll() {
  return db.select().from(categories).orderBy(asc(categories.name));
}

export async function findById(id: number) {
  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);

  return category;
}

export async function findByName(name: string) {
  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.name, name))
    .limit(1);

  return category;
}

export async function create(values: NewCategory) {
  await db.insert(categories).values(values);

  return findByName(values.name);
}

export async function update(id: number, values: CategoryUpdate) {
  await db.update(categories).set(values).where(eq(categories.id, id));

  return findById(id);
}

export async function remove(id: number) {
  await db.delete(categories).where(eq(categories.id, id));
}
