import { isAppEngine } from "#/src/lib/utils";
import { loadSecrets } from "#/src/lib/utils/infisical";
import fs from "fs";

(async () => {
  const secrets = await loadSecrets();

  if (!isAppEngine()) {
    const secret = secrets.find(
      (secret) => secret.secretKey === "GOOGLE_APPLICATION_CREDENTIALS"
    );

    if (secret) {
      fs.writeFileSync("./service_account.json", secret.secretValue, {
        flag: "w",
      });
      secret.secretValue = "./service_account.json";
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
})();
