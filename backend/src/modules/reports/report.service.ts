import * as reportRepository from "./report.repository.js";

import type {
  InventoryValueQuery,
  LowStockReportQuery,
  SalesReportQuery,
  StockMovementReportQuery,
  TopProductsQuery,
} from "./report.validation.js";

export function getSalesSummary(
  query: SalesReportQuery,
) {
  return reportRepository.getSalesSummary(query);
}

export function getSalesByDate(
  query: SalesReportQuery,
) {
  return reportRepository.getSalesByDate(query);
}

export function getTopProducts(
  query: TopProductsQuery,
) {
  return reportRepository.getTopProducts(query);
}

export function getLowStockReport(
  query: LowStockReportQuery,
) {
  return reportRepository.getLowStockReport(query);
}

export function getInventoryValue(
  query: InventoryValueQuery,
) {
  return reportRepository.getInventoryValue(query);
}

export function getStockMovementReport(
  query: StockMovementReportQuery,
) {
  return reportRepository.getStockMovementReport(query);
}


