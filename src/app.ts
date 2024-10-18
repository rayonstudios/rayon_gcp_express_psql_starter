import { RegisterRoutes } from "#/dist/routes";
import cors from "cors";
import express, { json, urlencoded } from "express";
import morgan from "morgan";
import multer from "multer";
import swaggerUi from "swagger-ui-express";
import { toResponse } from "./lib/utils";
import { loadSecrets } from "./lib/utils/infisical";
import { statusConst } from "./lib/utils/status";
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

// status check
app.get("/", (_, res) => {
  res.status(200).send(
    toResponse({
      data: { message: `Hello World! This is ${process.env.NODE_ENV} env` },
    })
  );
});

// reload secrets webhook
app.post("/reload_secrets", async (req, res) => {
  const { key } = req.query;
  if (key !== process.env.INFISICAL_WEBHOOK_KEY) {
    res
      .status(statusConst.unAuthenticated.code)
      .json(toResponse({ error: statusConst.unAuthenticated.message }));
    return;
  }

  const secrets = await loadSecrets();
  secrets.forEach((secret) => {
    process.env[secret.secretKey] = secret.secretValue;
  });
  res.status(200).json(toResponse({ data: { message: "Secrets reloaded" } }));
});

// request logger
app.use(morgan("short"));

// swagger docs
app.use("/docs", swaggerUi.serve, setupSwagger);

// tsoa register routes
RegisterRoutes(app, {
  multer: multer({
    dest: "/tmp",
  }),
});

// global error handler
app.use(globalErrorHandler);
