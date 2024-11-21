import fs from "fs";
import { fetchSecrets } from "./helpers";

(async () => {
  const secrets = await fetchSecrets(
    process.env.ENV ?? process.env.NODE_ENV ?? "dev"
  );

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

  fs.writeFileSync(
    ".env",
    `XATA_API_KEY=${secrets.find((s) => s.secretKey === "XATA_API_KEY")?.secretValue}`
  );
})();
