import type {
  Request,
  Response,
} from "express";

import * as stockService from "./stock.service.js";

import {
  stockAdjustmentSchema,
  stockMovementQuerySchema,
} from "./stock.validation.js";

export async function createStockAdjustment(
  request: Request,
  response: Response,
): Promise<void> {
  const input =
    stockAdjustmentSchema.parse(request.body);

  const adjustment =
    await stockService.adjustStock(input);

  response.status(201).json({
    success: true,
    message: "Stock adjusted successfully",
    data: adjustment,
  });
}
export async function listStockMovements(
  request: Request,
  response: Response,
): Promise<void> {
  const query =
    stockMovementQuerySchema.parse(request.query);

  const result =
    await stockService.getStockMovements(query);

  response.status(200).json({
    success: true,
    message:
      "Stock movements retrieved successfully",
    data: result,
  });
}

