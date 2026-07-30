import { apiGet } from "@/services/api/api-client"
import type {
  Paginated,
  Sale,
  SaleListItem,
  SaleQuery,
} from "@/types/api"

export function getSales(params: SaleQuery = {}) {
  return apiGet<Paginated<SaleListItem>>("/sales", params)
}

export function getSale(id: number) {
  return apiGet<Sale>(`/sales/${id}`)
}
