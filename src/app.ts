import { RegisterRoutes } from "#/routes";
import cors from "cors";
import express, { json, urlencoded } from "express";
import morgan from "morgan";
import multer from "multer";
import swaggerUi from "swagger-ui-express";
import { ROUTES_BASE_PATH } from "./lib/constants";
import { isCloudRun } from "./lib/utils";
import { globalErrorHandler } from "./middlewares/error.middleware";
import { notFoundMiddleware } from "./middlewares/not-found.middleware";
import { setupSwagger } from "./middlewares/swagger.middleware";

export const app = express();

// cors middleware
app.use((req, res, next) => {
  cors({ credentials: true, origin: "*" })(req, res, next);
});

// req data parsers
app.use(
  urlencoded({
    extended: true,
    limit: "32mb",
  })
);

app.use(json({ limit: "32mb" }));

// request logger
if (!isCloudRun()) {
  app.use(morgan("short"));
}

// Health check endpoint for Cloud Run
app.get("/health", (_, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: process.env.NODE_ENV,
  });
});

// tsoa register routes
RegisterRoutes(app, {
  multer: multer({
    dest: "/tmp",
    limits: {
      fileSize: 32 * 1024 * 1024, // 32MB limit
    },
  }),
});

// swagger docs
app.use(`${ROUTES_BASE_PATH}/docs`, swaggerUi.serve, setupSwagger);
app.get("/", (_, res) => {
  res.redirect(`${ROUTES_BASE_PATH}/docs`);
});

// handle non-existing routes
app.use(notFoundMiddleware);

// global error handler
app.use(globalErrorHandler);
