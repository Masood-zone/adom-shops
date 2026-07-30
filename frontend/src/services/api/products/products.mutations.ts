import {
  apiClient,
  apiPatch,
  apiPost,
} from "@/services/api/api-client"
import type { Product, ProductInput } from "@/types/api"

export function createProduct(body: ProductInput) {
  return apiPost<Product>("/products", body)
}

export function updateProduct(
  id: number,
  body: Omit<ProductInput, "openingStock">
) {
  return apiPatch<Product>(`/products/${id}`, body)
}

export function deactivateProduct(id: number) {
  return apiClient.delete(`/products/${id}`)
}
