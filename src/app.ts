import { RegisterRoutes } from "#/dist/routes";
import express, {
  json,
  NextFunction,
  Request,
  Response,
  urlencoded,
} from "express";
import swaggerUi from "swagger-ui-express";
import { ValidateError } from "tsoa";
import { toResponse } from "./lib/utils";
import { errorConst } from "./lib/utils/error";

export const app = express();

app.use(
  urlencoded({
    extended: true,
  })
);
app.use(json());

app.get("/", (_, res) => {
  res.send("Hello World!");
});

app.use("/docs", swaggerUi.serve, async (_req: any, res: any) => {
  return res.send(swaggerUi.generateHTML(await import("#/dist/swagger.json")));
});

RegisterRoutes(app);

// global error handler
app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ValidateError) {
    res
      .status(errorConst.invalidData.code)
      .json(toResponse({ error: JSON.stringify(err.fields) }));
  } else if (err instanceof Error) {
    console.error(err);
    res
      .status(errorConst.internal.code)
      .json(toResponse({ error: errorConst.internal.message }));
  }

  next(err);
});
