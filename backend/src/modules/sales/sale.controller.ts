import type {
  Request,
  Response,
} from "express";

import * as saleService from "./sale.service.js";

import {
  createSaleSchema,
  saleIdSchema,
  saleQuerySchema,
  voidSaleSchema,
} from "./sale.validation.js";

export async function listSales(
  request: Request,
  response: Response,
): Promise<void> {
  const query =
    saleQuerySchema.parse(request.query);

  const result =
    await saleService.getSales(query);

  response.status(200).json({
    success: true,
    message: "Sales retrieved successfully",
    data: result,
  });
}

export async function getSale(
  request: Request,
  response: Response,
): Promise<void> {
  const { id } =
    saleIdSchema.parse(request.params);

  const sale = await saleService.getSale(id);

  response.status(200).json({
    success: true,
    message: "Sale retrieved successfully",
    data: sale,
  });
}

export async function createSale(
  request: Request,
  response: Response,
): Promise<void> {
  const input =
    createSaleSchema.parse(request.body);

  const sale =
    await saleService.createSale(input);

  response.status(201).json({
    success: true,
    message: "Sale completed successfully",
    data: sale,
  });
}

export async function voidSale(
  request: Request,
  response: Response,
): Promise<void> {
  const { id } =
    saleIdSchema.parse(request.params);

  const input =
    voidSaleSchema.parse(request.body);

  const sale =
    await saleService.voidSale(id, input);

  response.status(200).json({
    success: true,
    message: "Sale voided successfully",
    data: sale,
  });
}

export async function getSaleReceipt(
  request: Request,
  response: Response,
): Promise<void> {
  const { id } =
    saleIdSchema.parse(request.params);

  const receipt =
    await saleService.getReceipt(id);

  response.status(200).json({
    success: true,
    message:
      "Receipt data retrieved successfully",
    data: receipt,
  });
}


