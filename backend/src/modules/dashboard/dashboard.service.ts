import * as dashboardRepository from "./dashboard.repository.js";

import type {
  DashboardSummaryQuery,
} from "./dashboard.validation.js";

export function getDashboardSummary(
  query: DashboardSummaryQuery,
) {
  return dashboardRepository.getSummary(query);
}


