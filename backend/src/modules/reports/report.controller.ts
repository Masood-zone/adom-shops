import type {
  Request,
  Response,
} from "express";

import * as reportService from "./report.service.js";

import {
  inventoryValueQuerySchema,
  lowStockReportQuerySchema,
  salesReportQuerySchema,
  stockMovementReportQuerySchema,
  topProductsQuerySchema,
} from "./report.validation.js";

export async function getSalesSummary(
  request: Request,
  response: Response,
): Promise<void> {
  const query =
    salesReportQuerySchema.parse(request.query);

  const report =
    await reportService.getSalesSummary(query);

  response.status(200).json({
    success: true,
    message:
      "Sales summary retrieved successfully",
    data: report,
  });
}

export async function getSalesByDate(
  request: Request,
  response: Response,
): Promise<void> {
  const query =
    salesReportQuerySchema.parse(request.query);

  const report =
    await reportService.getSalesByDate(query);

  response.status(200).json({
    success: true,
    message:
      "Sales-by-date report retrieved successfully",
    data: report,
  });
}

export async function getTopProducts(
  request: Request,
  response: Response,
): Promise<void> {
  const query =
    topProductsQuerySchema.parse(request.query);

  const report =
    await reportService.getTopProducts(query);

  response.status(200).json({
    success: true,
    message:
      "Top-products report retrieved successfully",
    data: report,
  });
}

export async function getLowStockReport(
  request: Request,
  response: Response,
): Promise<void> {
  const query =
    lowStockReportQuerySchema.parse(
      request.query,
    );

  const report =
    await reportService.getLowStockReport(
      query,
    );

  response.status(200).json({
    success: true,
    message:
      "Low-stock report retrieved successfully",
    data: report,
  });
}

export async function getInventoryValue(
  request: Request,
  response: Response,
): Promise<void> {
  const query =
    inventoryValueQuerySchema.parse(
      request.query,
    );

  const report =
    await reportService.getInventoryValue(
      query,
    );

  response.status(200).json({
    success: true,
    message:
      "Inventory-value report retrieved successfully",
    data: report,
  });
}

export async function getStockMovementReport(
  request: Request,
  response: Response,
): Promise<void> {
  const query =
    stockMovementReportQuerySchema.parse(
      request.query,
    );

  const report =
    await reportService.getStockMovementReport(
      query,
    );

  response.status(200).json({
    success: true,
    message:
      "Stock-movement report retrieved successfully",
    data: report,
  });
}


