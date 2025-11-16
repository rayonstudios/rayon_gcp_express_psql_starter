import dotenv from "dotenv";
import fs from "fs";
import { secretsEnvToJson, uploadSecrets } from "./helpers";

if (fs.existsSync("./.env.infisical")) {
  dotenv.config({ path: "./.env.infisical" });
}

(async () => {
  console.log("Reading secrets from .env file");
  const envPath = "./.env";
  const secrets = secretsEnvToJson(envPath);

  console.log("Found secrets:", secrets.map((s) => s.secretKey).join("\n"));
  console.log("\n\nUploading secrets to Infisical...");

  await uploadSecrets(
    process.env.ENV ?? process.env.NODE_ENV ?? "dev",
    secrets
  );

  console.log("Secrets uploaded successfully to Infisical");
})();
