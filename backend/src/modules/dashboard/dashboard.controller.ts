import type {
  Request,
  Response,
} from "express";

import * as dashboardService from "./dashboard.service.js";

import {
  dashboardSummaryQuerySchema,
} from "./dashboard.validation.js";

export async function getDashboardSummary(
  request: Request,
  response: Response,
): Promise<void> {
  const query =
    dashboardSummaryQuerySchema.parse(
      request.query,
    );

  const summary =
    await dashboardService.getDashboardSummary(
      query,
    );

  response.status(200).json({
    success: true,
    message:
      "Dashboard summary retrieved successfully",
    data: summary,
  });
}


