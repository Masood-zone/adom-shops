import { apiPost } from "@/services/api/api-client"
import type { Sale } from "@/types/api"

export type CreateSaleInput = {
  items: Array<{ productId: number; quantity: number }>
  notes?: string
}

export function createSale(body: CreateSaleInput) {
  return apiPost<Sale>("/sales", body)
}

export function voidSale(id: number, reason: string) {
  return apiPost<Sale>(`/sales/${id}/void`, { reason })
}
