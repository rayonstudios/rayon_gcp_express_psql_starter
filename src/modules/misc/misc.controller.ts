import { fetchSecrets } from "#/scripts/helpers";
import { APIResponse, Message } from "#/src/lib/types/misc";
import { GenericObject } from "#/src/lib/types/utils";
import { isDevEnv, isProdEnv, toResponse } from "#/src/lib/utils";
import { Controller, Get, Post, Query, Route, Security, Tags } from "tsoa";

@Route("")
@Tags("Miscellaneous")
export class MiscController extends Controller {
  @Get("/status")
  public async miscGetStatus(): Promise<APIResponse<Message>> {
    return toResponse({
      data: { message: `Hello World! This is ${process.env.NODE_ENV} env` },
    });
  }

  @Get("/openapi.json")
  public async miscGetOpenApiSpec(): Promise<GenericObject> {
    const json = await import("#/swagger.json");
    return json;
  }

  @Post("/reload-secrets")
  @Security("api_key")
  public async miscReloadSecrets(
    @Query() api_key: string
  ): Promise<APIResponse<Message>> {
    const secrets = await fetchSecrets(
      isProdEnv() ? "production" : isDevEnv() ? "dev" : "test"
    );
    secrets.forEach((secret) => {
      process.env[secret.secretKey] = secret.secretValue;
    });

    return toResponse({
      data: { message: "Secrets reloaded" },
    });
  }
}
