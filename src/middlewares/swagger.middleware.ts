import { NextFunction, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";

export const setupSwagger = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const json = await import("#/dist/swagger.json");
  //   json.components.securitySchemes = {
  //     JWT: {
  //       type: "http",
  //       scheme: "bearer",
  //       bearerFormat: "A resource owner JWT",
  //     },
  //   };
  //   (json as any).security = [{ JWT: [] }];
  //   Object.values(json.paths).forEach((path) => {
  //     Object.values(path).forEach((method) => {
  //       //@ts-ignore
  //       //   if (method.security) method.security = [{ JWT: [] }];
  //       if (method.security) delete method.security;
  //     });
  //   });

  swaggerUi.setup(json, {
    swaggerOptions: {
      // log in for all requests
      responseInterceptor: (res: Request) => {
        if (res.url.endsWith("/auth/login")) {
          const token = res?.body?.data?.accessToken;
          if (token)
            eval(
              `ui.preauthorizeApiKey("jwt", "${token}"); localStorage.setItem("accessToken", "${token}")`
            );
        } else if (res.url.endsWith("/auth/logout")) {
          if (res?.body) {
            eval(
              `ui.authActions.logout(["jwt"]); localStorage.removeItem("accessToken")`
            );
          }
        }
      },
      onComplete: () => {
        const token = eval(`localStorage.getItem("accessToken")`);
        if (token) eval(`ui.preauthorizeApiKey("jwt", "${token}")`);
      },
    },
  })(req, res, next);
};
