import { apiGet } from "@/services/api/api-client"
import type { Category } from "@/types/api"

export function getCategories() {
  return apiGet<Category[]>("/categories")
}
