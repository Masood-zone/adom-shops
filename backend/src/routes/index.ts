import { Router } from "express";
import { categoryRouter } from "../modules/categories/categories.routes.js";
import { dashboardRouter } from "../modules/dashboard/dashboard.routes.js";
import { productRouter } from "../modules/products/product.routes.js";
import { reportRouter } from "../modules/reports/report.routes.js";
import { saleRouter } from "../modules/sales/sale.routes.js";
import { stockRouter } from "../modules/stock/stock.routes.js";

export const apiRouter = Router();

apiRouter.get("/health", (_request, response) => {
  response.status(200).json({
    success: true,
    message: "Adom Shops API is running",
    data: {
      timestamp: new Date().toISOString(),
    },
  });
});

apiRouter.use("/dashboard", dashboardRouter);
apiRouter.use("/categories", categoryRouter);
apiRouter.use("/products", productRouter);
apiRouter.use("/stock", stockRouter);
apiRouter.use("/sales", saleRouter);
apiRouter.use("/reports", reportRouter);
