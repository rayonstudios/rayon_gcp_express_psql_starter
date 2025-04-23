import { RegisterRoutes } from "#/routes";
import cors from "cors";
import express, { json, urlencoded } from "express";
import morgan from "morgan";
import multer from "multer";
import swaggerUi from "swagger-ui-express";
import { ROUTES_BASE_PATH } from "./lib/constants";
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
  })
);
app.use(json());

// request logger
app.use(morgan("short"));

// tsoa register routes
RegisterRoutes(app, {
  multer: multer({
    dest: "/tmp",
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
