import { Router } from "express";

import {
  createProduct,
  deactivateProduct,
  getProduct,
  listProducts,
  updateProduct,
} from "./product.controller.js";

export const productRouter = Router();

productRouter.route("/").get(listProducts).post(createProduct);

productRouter
  .route("/:id")
  .get(getProduct)
  .patch(updateProduct)
  .delete(deactivateProduct);
