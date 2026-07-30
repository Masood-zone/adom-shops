import { Router } from "express";

import {
  createStockAdjustment,
  listStockMovements,
} from "./stock.controller.js";

export const stockRouter = Router();

stockRouter.post(
  "/adjustments",
  createStockAdjustment,
);

stockRouter.get(
  "/movements",
  listStockMovements,
);
