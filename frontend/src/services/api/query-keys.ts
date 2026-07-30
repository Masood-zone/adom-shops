import type {
  DateRangeQuery,
  ProductQuery,
  SaleQuery,
  StockMovementQuery,
} from "@/types/api"

export const queryKeys = {
  dashboard: ["dashboard"] as const,
  categories: ["categories"] as const,
  products: {
    all: ["products"] as const,
    list: (query: ProductQuery) => ["products", "list", query] as const,
    detail: (id: number) => ["products", "detail", id] as const,
  },
  stock: {
    all: ["stock"] as const,
    movements: (query: StockMovementQuery) =>
      ["stock", "movements", query] as const,
  },
  sales: {
    all: ["sales"] as const,
    list: (query: SaleQuery) => ["sales", "list", query] as const,
    detail: (id: number) => ["sales", "detail", id] as const,
  },
  reports: {
    all: ["reports"] as const,
    summary: (query: DateRangeQuery) =>
      ["reports", "summary", query] as const,
    byDate: (query: DateRangeQuery) =>
      ["reports", "by-date", query] as const,
    topProducts: (query: DateRangeQuery) =>
      ["reports", "top-products", query] as const,
    inventory: (categoryId?: number) =>
      ["reports", "inventory", categoryId] as const,
    lowStock: ["reports", "low-stock"] as const,
  },
}
