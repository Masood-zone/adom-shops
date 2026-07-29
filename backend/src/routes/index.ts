import { Router } from "express";
import { categoryRouter } from "../modules/categories/categories.routes.js";

export const apiRouter = Router();

apiRouter.get("/health", (_request, response) => {
  response.status(200).json({
    success: true,
    message: "Adom Shops API is running",
    timestamp: new Date().toISOString(),
  });
});

apiRouter.use("/categories", categoryRouter);
