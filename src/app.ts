import { RegisterRoutes } from "#/routes";
import cors from "cors";
import express, { json, urlencoded } from "express";
import morgan from "morgan";
import multer from "multer";
import swaggerUi from "swagger-ui-express";
import { globalErrorHandler } from "./middlewares/error.middleware";
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
app.use("/", swaggerUi.serve, setupSwagger);

// global error handler
app.use(globalErrorHandler);
