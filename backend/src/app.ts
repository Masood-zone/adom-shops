import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env.js";

import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error-handler.js";

import { apiRouter } from "./routes/index.js";

export const app = express();

app.disable("x-powered-by");

app.use(helmet());

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

app.use(
  express.json({
    limit: "1mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.get("/", (_request, response) => {
  response.status(200).json({
    success: true,
    message: "Welcome to the Adom Shops API",
  });
});

app.use("/api/v1", apiRouter);

app.use(notFoundHandler);

app.use(errorHandler);
