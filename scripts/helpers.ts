const infisicalBaseUrl = "https://app.infisical.com/api";

export async function getInfisicalToken() {
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

export async function fetchSecret(key: string, env: string) {
  const accessToken = await getInfisicalToken();

  const {
    secret: { secretValue },
  } = await fetch(
    `${infisicalBaseUrl}/v3/secrets/raw/${key}?workspaceId=${
      process.env.INFISICAL_PROJECT_ID
    }&environment=${env}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  ).then((res) => res.json());

  return secretValue;
}

export async function fetchSecrets(env: string) {
  const accessToken = await getInfisicalToken();

  const { secrets }: { secrets: { secretKey: string; secretValue: string }[] } =
    await fetch(
      `${infisicalBaseUrl}/v3/secrets/raw?workspaceId=${
        process.env.INFISICAL_PROJECT_ID
      }&environment=${env}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    ).then((res) => res.json());

  return secrets.filter(
    (secret) =>
      !(secret.secretKey === "GOOGLE_APPLICATION_CREDENTIALS" && isAppEngine())
  );
}

export function importSecrets() {
  const env = require(".env.json");
  process.env = {
    ...process.env,
    ...env,
  };
}

export async function updateSecret(key: string, value: string, env: string) {
  const accessToken = await getInfisicalToken();

  await fetch(`${infisicalBaseUrl}/v3/secrets/raw/${key}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      secretValue: value,
      environment: env === "dev" ? "dev" : "production",
      workspaceId: process.env.INFISICAL_PROJECT_ID,
    }),
  })
    .then((res) => res.json())
    .catch(console.log);
}

export function isAppEngine() {
  return process.env.GAE_ENV === "standard";
}

export function isPRMerged(commitMsg: string, fromBranch: string) {
  return new RegExp(
    String.raw`^Merge pull request #\d+ from .*\/${fromBranch}\b`,
    "gm"
  ).test(commitMsg);
}

export function shortPoll(fn: () => any, interval: number) {
  return new Promise<boolean>(async (resolve) => {
    while (true) {
      const result = await fn();
      if (typeof result === "boolean") {
        resolve(result);
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  });
}

export const getBEUrl = (env: string) =>
  env === "dev"
    ? "https://compact-flash-306512.el.r.appspot.com"
    : "https://compact-flash-306512.el.r.appspot.com";
