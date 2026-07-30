import {
  apiClient,
  apiPatch,
  apiPost,
} from "@/services/api/api-client"
import type { Category } from "@/types/api"

type CategoryInput = Pick<Category, "name" | "description">

export function createCategory(body: CategoryInput) {
  return apiPost<Category>("/categories", body)
}

export function updateCategory(id: number, body: Partial<CategoryInput>) {
  return apiPatch<Category>(`/categories/${id}`, body)
}

export function deleteCategory(id: number) {
  return apiClient.delete(`/categories/${id}`)
}
