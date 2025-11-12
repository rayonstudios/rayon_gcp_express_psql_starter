import * as fs from "fs";
import * as path from "path";

const infisicalBaseUrl = "https://app.infisical.com/api";

type Secret = { secretKey: string; secretValue: string };

async function getInfisicalToken() {
  const { accessToken } = await fetch(
    `${infisicalBaseUrl}/v1/auth/universal-auth/login`,
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

  return accessToken;
}

export function createXataRcFile(secrets: Secret[]) {
  // Update .xatarc file with database URL
  const databaseUrl = secrets.find(
    (secret) => secret.secretKey === "DATABASE_URL"
  )?.secretValue;
  const xataWorkspaceSlug = secrets.find(
    (secret) => secret.secretKey === "XATA_WORKSPACE_SLUG"
  )?.secretValue;

  if (databaseUrl && xataWorkspaceSlug) {
    try {
      // Extract region and database from DATABASE_URL
      // Format: postgresql://user:pass@region.sql.xata.sh/database:branch?params
      const match = databaseUrl.match(/@([^.]+)\.sql\.xata\.sh\/([^?]+)/);

      if (match) {
        const region = match[1];
        const databaseWithBranch = match[2];
        const database = databaseWithBranch.split(":")[0];

        const xataConfig = {
          databaseURL: `https://${xataWorkspaceSlug}.${region}.xata.sh/db/${database}`,
        };

        const xatarcPath = path.join(process.cwd(), ".xatarc");
        fs.writeFileSync(xatarcPath, JSON.stringify(xataConfig, null, 2));

        console.log("✓ Updated .xatarc file");
      }
    } catch (error) {
      console.error("Failed to update .xatarc file:", error);
    }
  }
}

export async function fetchSecrets(env: string) {
  const accessToken = await getInfisicalToken();

  const { secrets }: { secrets: Secret[] } = await fetch(
    `${infisicalBaseUrl}/v3/secrets/raw?workspaceId=${
      process.env.INFISICAL_PROJECT_ID
    }&environment=${env}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  ).then((res) => res.json());

  const filteredSecrets = secrets.filter(
    (secret) =>
      !(secret.secretKey === "GOOGLE_APPLICATION_CREDENTIALS" && isCloudRun())
  );

  return filteredSecrets;
}

export function importSecrets() {
  const env = require(".env.json");
  process.env = {
    ...process.env,
    ...env,
  };
}

export function isCloudRun() {
  return process.env.K_SERVICE && process.env.K_REVISION;
}

export function isPRMerged(commitMsg: string, fromBranch: string) {
  return new RegExp(
    String.raw`^Merge pull request #\d+ from .*\/${fromBranch}\b`,
    "gm"
  ).test(commitMsg);
}

export const getBEUrl = (env: string) => {
  if (env === "production") {
    return "https://be.starters.rayonstudios.com/api/v1";
  }
  if (env === "test") {
    return "https://be.test.starters.rayonstudios.com/api/v1";
  }
  return "https://be.dev.starters.rayonstudios.com/api/v1";
};

export const secretsEnvToJson = (filePath: string) => {
  const envContent = fs.readFileSync(filePath, "utf-8");
  const lines = envContent.split("\n");

  const secrets: Secret[] = lines
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const [key, ...rest] = line.split("=");
      return {
        secretKey: key,
        secretValue: rest.join("=").trim(),
      };
    });

  return secrets;
};

export function uploadSecrets(env: string, secrets: Secret[]) {
  return getInfisicalToken().then((accessToken) => {
    return fetch(`${infisicalBaseUrl}/v4/secrets/batch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        projectId: process.env.INFISICAL_PROJECT_ID,
        environment: env,
        secrets,
      }),
    }).then((res) => res.json());
  });
}
