import { apiGet } from "@/services/api/api-client"
import type { DashboardSummary } from "@/types/api"

export function getDashboardSummary() {
  return apiGet<DashboardSummary>("/dashboard/summary")
}
