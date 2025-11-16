import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { GoogleAuth } from "google-auth-library";
import { execSync } from "child_process";

dotenv.config();

const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const FIRESTORE_DB_ID = process.env.FIRESTORE_DB_ID;
const GOOGLE_APPLICATION_CREDENTIALS =
  process.env.GOOGLE_APPLICATION_CREDENTIALS;

console.log(
  `Pulling Firestore configuration for project: ${GOOGLE_CLOUD_PROJECT} and database: ${FIRESTORE_DB_ID}`
);

const auth = new GoogleAuth({
  keyFile: GOOGLE_APPLICATION_CREDENTIALS,
  scopes: [
    "https://www.googleapis.com/auth/cloud-platform",
    "https://www.googleapis.com/auth/datastore",
    "https://www.googleapis.com/auth/firebase",
  ],
});

// Get access token using Google Auth Library
async function getAccessToken(): Promise<string> {
  try {
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    if (!accessToken.token) {
      throw new Error("Failed to obtain access token");
    }

    return accessToken.token;
  } catch (error: any) {
    console.error("Error getting access token:", error.message);
    process.exit(1);
  }
}

// Fetch data from Google API
function fetchFromAPI(url: string, token: string) {
  return fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json());
}

async function pullIndexes() {
  const output = execSync(
    `firebase firestore:indexes --database=${FIRESTORE_DB_ID} --project=${GOOGLE_CLOUD_PROJECT}`,
    { encoding: "utf-8" }
  );

  const indexesFilePath = path.join(process.cwd(), "firestore.indexes.json");
  fs.writeFileSync(indexesFilePath, output, "utf-8");

  console.log(`✓ Firestore indexes saved to ${indexesFilePath}`);
}

async function pullRules() {
  try {
    const token = await getAccessToken();

    const releaseData: any = await fetchFromAPI(
      `https://firebaserules.googleapis.com/v1/projects/${GOOGLE_CLOUD_PROJECT}/releases/cloud.firestore/${FIRESTORE_DB_ID}`,
      token
    );

    const rulesetName = releaseData.rulesetName;
    if (!rulesetName) {
      console.warn("Warning: No active ruleset found for this database");
      return;
    }

    const rulesetData: any = await fetchFromAPI(
      `https://firebaserules.googleapis.com/v1/${rulesetName}`,
      token
    );

    // Extract the rules content from the first source file
    if (rulesetData.source?.files?.[0]?.content) {
      const rulesContent = rulesetData.source.files[0].content;
      const rulesFilePath = path.join(process.cwd(), "firestore.rules");

      fs.writeFileSync(rulesFilePath, rulesContent, "utf-8");
      console.log(`✓ Firestore rules saved to ${rulesFilePath}`);
    }
  } catch (error: any) {
    console.error("Error pulling rules:", error.message);
    throw error;
  }
}

(async () => {
  await pullIndexes();
  await pullRules();
})();
