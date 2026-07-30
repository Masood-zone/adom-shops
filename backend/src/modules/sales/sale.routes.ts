import { Router } from "express";

import {
  createSale,
  getSale,
  getSaleReceipt,
  listSales,
  voidSale,
} from "./sale.controller.js";

export const saleRouter = Router();

saleRouter
  .route("/")
  .get(listSales)
  .post(createSale);

saleRouter.get(
  "/:id/receipt",
  getSaleReceipt,
);

saleRouter.post(
  "/:id/void",
  voidSale,
);

saleRouter.get(
  "/:id",
  getSale,
);


