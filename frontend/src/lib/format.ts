import type { Product } from "@/types/api"

export const currency = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  currencyDisplay: "narrowSymbol",
  minimumFractionDigits: 2,
})

export const number = new Intl.NumberFormat("en-GH")

export function formatCurrency(value: string | number) {
  return currency.format(Number(value)).replace("GH₵", "GH₵ ")
}

export function formatDate(value: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-GH", {
    dateStyle: "medium",
    timeStyle: "short",
    ...options,
  }).format(new Date(value))
}

export type StockStatus = "inactive" | "out" | "low" | "healthy"

export function getStockStatus(
  product: Pick<Product, "isActive" | "quantityInStock" | "reorderLevel">
): StockStatus {
  if (!product.isActive) return "inactive"
  if (product.quantityInStock === 0) return "out"
  if (product.quantityInStock <= product.reorderLevel) return "low"
  return "healthy"
}

export function titleCase(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export function buildSearchParams(
  values: Record<string, string | number | boolean | undefined>
) {
  const params = new URLSearchParams()
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value))
  })
  return params
}
