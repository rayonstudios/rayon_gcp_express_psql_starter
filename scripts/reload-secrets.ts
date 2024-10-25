import { getBEUrl, importSecrets } from "./helpers";

importSecrets();

const env = process.argv[2] || "dev";

(async () => {
  await fetch(
    `${getBEUrl(env)}/api/reload_secrets?key=${process.env.INFISICAL_WEBHOOK_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  console.log("secrets reloaded successfully");
})();
