import { apiPost } from "@/services/api/api-client"
import type { StockMovement } from "@/types/api"

export type StockAdjustmentInput = {
  productId: number
  type: "RESTOCK" | "ADJUSTMENT_IN" | "ADJUSTMENT_OUT"
  quantity: number
  reason: string
}

export function createStockAdjustment(body: StockAdjustmentInput) {
  return apiPost<StockMovement>("/stock/adjustments", body)
}
