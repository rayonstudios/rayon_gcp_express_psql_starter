import { NextFunction, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { APP_TITLE } from "../lib/constants";

export const setupSwagger = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const json = await import("#/swagger.json");
  json.info.title = APP_TITLE;

  swaggerUi.setup(json, {
    swaggerOptions: {
      responseInterceptor: (res: any) => {
        if (
          res.status === 401 ||
          (res.url.endsWith("/auth/logout") && res.status === 200)
        ) {
          eval(
            `ui.authActions.logout(["jwt"]); localStorage.removeItem("accessToken")`
          );
        } else if (res.url.endsWith("/auth/login")) {
          const token = res?.body?.data?.accessToken;
          if (token)
            eval(
              `ui.preauthorizeApiKey("jwt", "${token}"); localStorage.setItem("accessToken", "${token}")`
            );
        }
      },
      onComplete: () => {
        const token = eval(`localStorage.getItem("accessToken")`);
        if (token) eval(`ui.preauthorizeApiKey("jwt", "${token}")`);
      },
    },
  })(req, res, next);
};
