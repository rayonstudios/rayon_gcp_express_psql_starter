import { isAppEngine } from "#/src/lib/utils";
import dotenv from "dotenv";
dotenv.config({
  path: "./.env.infisical",
  override: true,
});

export const loadSecrets = async () => {
  const baseUrl = "https://app.infisical.com/api";

  const { accessToken } = await fetch(
    `${baseUrl}/v1/auth/universal-auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientId: process.env.INFISICAL_CLIENT_ID!,
        clientSecret: process.env.INFISICAL_CLIENT_SECRET!,
      }),
    }
  ).then((res) => res.json());

  const { secrets }: { secrets: { secretKey: string; secretValue: string }[] } =
    await fetch(
      `${baseUrl}/v3/secrets/raw?workspaceSlug=${
        process.env.INFISICAL_WORKSPACE_SLUG
      }&environment=${process.env.ENV ?? process.env.NODE_ENV ?? "dev"}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    ).then((res) => res.json());

  return secrets.filter(
    (secret) =>
      // filter GOOGLE_APPLICATION_CREDENTIALS if it's value is unset or file does not exist
      !(secret.secretKey === "GOOGLE_APPLICATION_CREDENTIALS" && isAppEngine())
  );
};
