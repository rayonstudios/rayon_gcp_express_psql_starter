import { RegisterRoutes } from "#/dist/routes";
import express, { json, urlencoded } from "express";
import swaggerUi from "swagger-ui-express";

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
