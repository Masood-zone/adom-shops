import { eq } from "drizzle-orm";

import { db, pool } from "./index.js";
import {
  categories,
  products,
  stockMovements,
} from "./schema/index.js";

const demoCategories = [
  {
    name: "Groceries",
    description: "Everyday food and pantry products",
  },
  {
    name: "Beverages",
    description: "Water, soft drinks, juices, and other beverages",
  },
  {
    name: "Household",
    description: "Cleaning and household essentials",
  },
] as const;

const demoProducts = [
  {
    categoryName: "Groceries",
    sku: "ADS-RICE-5KG",
    name: "Premium Rice 5kg",
    description: "Long-grain rice",
    unitPrice: "95.00",
    openingStock: 24,
    reorderLevel: 6,
  },
  {
    categoryName: "Beverages",
    sku: "ADS-WATER-15L",
    name: "Bottled Water 1.5L",
    description: "Still drinking water",
    unitPrice: "8.50",
    openingStock: 48,
    reorderLevel: 12,
  },
  {
    categoryName: "Household",
    sku: "ADS-DETERGENT-1KG",
    name: "Laundry Detergent 1kg",
    description: "Powder laundry detergent",
    unitPrice: "42.00",
    openingStock: 18,
    reorderLevel: 5,
  },
] as const;

async function seed(): Promise<void> {
  await db.transaction(async (tx) => {
    const categoryIds = new Map<string, number>();

    for (const categoryInput of demoCategories) {
      const [existing] = await tx
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.name, categoryInput.name))
        .limit(1);

      if (existing) {
        categoryIds.set(categoryInput.name, existing.id);
        continue;
      }

      const [inserted] = await tx
        .insert(categories)
        .values(categoryInput)
        .$returningId();

      if (!inserted) {
        throw new Error(`Could not seed category ${categoryInput.name}`);
      }

      categoryIds.set(categoryInput.name, inserted.id);
    }

    for (const productInput of demoProducts) {
      const [existing] = await tx
        .select({ id: products.id })
        .from(products)
        .where(eq(products.sku, productInput.sku))
        .limit(1);

      if (existing) {
        continue;
      }

      const categoryId = categoryIds.get(productInput.categoryName);

      if (!categoryId) {
        throw new Error(
          `Could not resolve seeded category ${productInput.categoryName}`,
        );
      }

      const [inserted] = await tx
        .insert(products)
        .values({
          categoryId,
          sku: productInput.sku,
          name: productInput.name,
          description: productInput.description,
          unitPrice: productInput.unitPrice,
          quantityInStock: productInput.openingStock,
          reorderLevel: productInput.reorderLevel,
          isActive: true,
        })
        .$returningId();

      if (!inserted) {
        throw new Error(`Could not seed product ${productInput.sku}`);
      }

      if (productInput.openingStock > 0) {
        await tx.insert(stockMovements).values({
          productId: inserted.id,
          type: "OPENING_STOCK",
          quantity: productInput.openingStock,
          previousStock: 0,
          newStock: productInput.openingStock,
          reason: "Opening stock from demo seed",
        });
      }
    }
  });
}

try {
  await seed();
  console.log("Demo inventory seeded successfully");
} catch (error) {
  console.error("Could not seed demo inventory:", error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
