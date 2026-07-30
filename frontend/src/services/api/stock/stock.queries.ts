import { apiGet } from "@/services/api/api-client"
import type {
  Paginated,
  StockMovement,
  StockMovementQuery,
} from "@/types/api"

export function getStockMovements(params: StockMovementQuery = {}) {
  return apiGet<Paginated<StockMovement>>("/stock/movements", params)
}
