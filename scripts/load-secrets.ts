import fs from "fs";
import { createXataRcFile, fetchSecrets, isCloudRun } from "./helpers";

if (fs.existsSync("./.env.infisical")) {
  const content = fs.readFileSync("./.env.infisical", "utf-8").trim();
  const lines = content.split("\n");
  lines.forEach((line) => {
    const [key, value] = line.split("=");
    process.env[key] = value;
  });
}

(async () => {
  const secrets = await fetchSecrets(
    process.env.ENV ?? process.env.NODE_ENV ?? "dev"
  );
  createXataRcFile(secrets);

  if (!isCloudRun()) {
    const secret = secrets.find(
      (secret) => secret.secretKey === "GOOGLE_APPLICATION_CREDENTIALS"
    );

    if (secret) {
      fs.writeFileSync("./service_account.json", secret.secretValue, {
        flag: "w",
      });
      secret.secretValue = "./service_account.json";
      console.log(
        "✓ Created service_account.json file with GCP service account credentials"
      );
    }
  }

  fs.writeFileSync(
    "./.env",
    secrets.reduce(
      (acc: string, secret: any) =>
        acc + `${secret.secretKey}=${secret.secretValue}\n`,
      ""
    ),
    { flag: "w" }
  );

  console.log("Secrets loaded successfully in .env file");
})();
