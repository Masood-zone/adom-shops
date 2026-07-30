import { apiGet } from "@/services/api/api-client"
import type {
  DateRangeQuery,
  InventoryValue,
  LowStockReportItem,
  Paginated,
  SalesByDate,
  SalesSummary,
  StockMovement,
  StockMovementQuery,
  TopProduct,
} from "@/types/api"

export function getSalesSummary(params: DateRangeQuery = {}) {
  return apiGet<SalesSummary>("/reports/sales-summary", params)
}

export function getSalesByDate(params: DateRangeQuery = {}) {
  return apiGet<SalesByDate[]>("/reports/sales-by-date", params)
}

export function getTopProducts(
  params: DateRangeQuery & { limit?: number } = {}
) {
  return apiGet<TopProduct[]>("/reports/top-products", params)
}

export function getLowStockReport(
  params: { page?: number; limit?: number } = {}
) {
  return apiGet<Paginated<LowStockReportItem>>("/reports/low-stock", params)
}

export function getInventoryValue(params: { categoryId?: number } = {}) {
  return apiGet<InventoryValue>("/reports/inventory-value", params)
}

export function getStockMovementReport(params: StockMovementQuery = {}) {
  return apiGet<Paginated<StockMovement>>(
    "/reports/stock-movements",
    params
  )
}
