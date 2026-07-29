import type { Request, Response } from "express";

import * as categoryService from "./categories.service.js";

import {
  categoryIdSchema,
  createCategorySchema,
  updateCategorySchema,
} from "./categories.validation.js";

export async function listCategories(
  _request: Request,
  response: Response,
): Promise<void> {
  const categories = await categoryService.getCategories();

  response.status(200).json({
    success: true,
    data: categories,
  });
}

export async function getCategory(
  request: Request,
  response: Response,
): Promise<void> {
  const { id } = categoryIdSchema.parse(request.params);

  const category = await categoryService.getCategory(id);

  response.status(200).json({
    success: true,
    data: category,
  });
}

export async function createCategory(
  request: Request,
  response: Response,
): Promise<void> {
  const input = createCategorySchema.parse(request.body);

  const category = await categoryService.createCategory(input);

  response.status(201).json({
    success: true,
    message: "Category created successfully",
    data: category,
  });
}

export async function updateCategory(
  request: Request,
  response: Response,
): Promise<void> {
  const { id } = categoryIdSchema.parse(request.params);

  const input = updateCategorySchema.parse(request.body);

  const category = await categoryService.updateCategory(id, input);

  response.status(200).json({
    success: true,
    message: "Category updated successfully",
    data: category,
  });
}

export async function deleteCategory(
  request: Request,
  response: Response,
): Promise<void> {
  const { id } = categoryIdSchema.parse(request.params);

  await categoryService.deleteCategory(id);

  response.status(204).send();
}
