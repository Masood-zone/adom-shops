import { Router } from "express";

import {
  createCategory,
  deleteCategory,
  getCategory,
  listCategories,
  updateCategory,
} from "./categories.controller.js";

export const categoryRouter = Router();

categoryRouter.route("/").get(listCategories).post(createCategory);

categoryRouter
  .route("/:id")
  .get(getCategory)
  .patch(updateCategory)
  .delete(deleteCategory);
