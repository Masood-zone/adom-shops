import type { Request, Response } from "express";

import * as productService from "./product.service.js";
import {
  createProductSchema,
  productIdSchema,
  productQuerySchema,
  updateProductSchema,
} from "./product.validation.js";

export async function listProducts(
  request: Request,
  response: Response,
): Promise<void> {
  const query = productQuerySchema.parse(request.query);
  const result = await productService.getProducts(query);

  response.status(200).json({
    success: true,
    message: "Products retrieved successfully",
    data: result,
  });
}

export async function getProduct(
  request: Request,
  response: Response,
): Promise<void> {
  const { id } = productIdSchema.parse(request.params);
  const product = await productService.getProduct(id);

  response.status(200).json({
    success: true,
    message: "Product retrieved successfully",
    data: product,
  });
}

export async function createProduct(
  request: Request,
  response: Response,
): Promise<void> {
  const input = createProductSchema.parse(request.body);
  const product = await productService.createProduct(input);

  response.status(201).json({
    success: true,
    message: "Product created successfully",
    data: product,
  });
}

export async function updateProduct(
  request: Request,
  response: Response,
): Promise<void> {
  const { id } = productIdSchema.parse(request.params);
  const input = updateProductSchema.parse(request.body);
  const product = await productService.updateProduct(id, input);

  response.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: product,
  });
}

export async function deactivateProduct(
  request: Request,
  response: Response,
): Promise<void> {
  const { id } = productIdSchema.parse(request.params);
  await productService.deactivateProduct(id);

  response.status(204).send();
}
