import fs from "fs";
import { createXataRcFile, fetchSecrets } from "./helpers";

(async () => {
  const secrets = await fetchSecrets(
    process.env.ENV ?? process.env.NODE_ENV ?? "dev"
  );

  createXataRcFile(secrets);

  fs.writeFileSync(
    ".env.json",
    JSON.stringify({
      ...process.env,
      ...secrets.reduce((acc, secret) => {
        acc[secret.secretKey] = secret.secretValue;
        return acc;
      }, {} as any),
    })
  );
})();
