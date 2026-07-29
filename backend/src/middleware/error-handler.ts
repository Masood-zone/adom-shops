import type { NextFunction, Request, Response } from "express";

import { ZodError } from "zod";

import { AppError } from "../common/errors/app-error.js";

interface MySqlError extends Error {
  code?: string;
}

function isMySqlError(error: unknown): error is MySqlError {
  return error instanceof Error && "code" in error;
}

export function notFoundHandler(request: Request, response: Response): void {
  response.status(404).json({
    success: false,
    message: "Route not found",
    path: request.originalUrl,
  });
}

export function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  next: NextFunction,
): void {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (error instanceof ZodError) {
    response.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });

    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      success: false,
      message: error.message,
      details: error.details,
    });

    return;
  }

  if (isMySqlError(error)) {
    if (error.code === "ER_DUP_ENTRY") {
      response.status(409).json({
        success: false,
        message: "A record with this value already exists",
      });

      return;
    }

    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      response.status(409).json({
        success: false,
        message:
          "This record cannot be deleted because another record depends on it",
      });

      return;
    }
  }

  console.error(error);

  response.status(500).json({
    success: false,
    message: "Internal server error",
  });
}
