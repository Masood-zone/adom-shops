import { apiGet } from "@/services/api/api-client"
import type { Paginated, Product, ProductQuery } from "@/types/api"

export function getProducts(params: ProductQuery = {}) {
  return apiGet<Paginated<Product>>("/products", params)
}

export function getProduct(id: number) {
  return apiGet<Product>(`/products/${id}`)
}
