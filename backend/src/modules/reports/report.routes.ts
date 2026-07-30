import { Router } from "express";

import {
  getInventoryValue,
  getLowStockReport,
  getSalesByDate,
  getSalesSummary,
  getStockMovementReport,
  getTopProducts,
} from "./report.controller.js";

export const reportRouter = Router();

reportRouter.get(
  "/sales-summary",
  getSalesSummary,
);

reportRouter.get(
  "/sales-by-date",
  getSalesByDate,
);

reportRouter.get(
  "/top-products",
  getTopProducts,
);

reportRouter.get(
  "/low-stock",
  getLowStockReport,
);

reportRouter.get(
  "/inventory-value",
  getInventoryValue,
);

reportRouter.get(
  "/stock-movements",
  getStockMovementReport,
);


