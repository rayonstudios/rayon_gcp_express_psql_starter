import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { GoogleAuth } from "google-auth-library";

// Load environment variables from .env file
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

// Transform Firestore API index format to firebase.json format
function transformIndexToFirebaseFormat(index: any): any {
  const transformed: any = {
    collectionGroup: index.name
      .split("/collectionGroups/")[1]
      .split("/indexes/")[0],
    queryScope: index.queryScope,
    fields: index.fields
      .filter((field: any) => field.fieldPath !== "__name__")
      .map((field: any) => {
        const fieldDef: any = {
          fieldPath: field.fieldPath,
        };
        if (field.order) {
          fieldDef.order = field.order;
        }
        if (field.arrayConfig) {
          fieldDef.arrayConfig = field.arrayConfig;
        }
        return fieldDef;
      }),
  };

  // Add optional properties if they exist
  if (index.density) {
    transformed.density = index.density;
  }

  return transformed;
}

async function pullIndexes(token: string) {
  try {
    const indexesResponse: any = await fetchFromAPI(
      `https://firestore.googleapis.com/v1/projects/${GOOGLE_CLOUD_PROJECT}/databases/${FIRESTORE_DB_ID}/collectionGroups/-/indexes`,
      token
    );

    // Transform indexes to firebase.json format
    const indexes =
      indexesResponse.indexes
        ?.filter((index: any) => index.state === "READY")
        .map(transformIndexToFirebaseFormat) || [];

    const fieldsResponse: any = await fetchFromAPI(
      `https://firestore.googleapis.com/v1/projects/${GOOGLE_CLOUD_PROJECT}/databases/${FIRESTORE_DB_ID}/collectionGroups/-/fields?filter=indexConfig.usesAncestorConfig=false OR ttlConfig:*`,
      token
    );

    const fieldOverrides: any[] = [];
    if (fieldsResponse.fields) {
      for (const field of fieldsResponse.fields) {
        // Skip the default field configuration
        if (field.name.includes("/__default__/")) {
          continue;
        }

        const collectionGroup = field.name
          .split("/collectionGroups/")[1]
          .split("/fields/")[0];
        const fieldPath = field.name.split("/fields/")[1];

        const override: any = {
          collectionGroup,
          fieldPath,
          indexes: [],
        };

        // Add TTL config if present
        if (field.ttlConfig) {
          override.ttl = true;
        }

        // Add index configurations
        if (
          field.indexConfig &&
          !field.indexConfig.usesAncestorConfig &&
          field.indexConfig.indexes
        ) {
          override.indexes = field.indexConfig.indexes.map((idx: any) => {
            const indexDef: any = {
              queryScope: idx.queryScope,
            };
            if (idx.order) {
              indexDef.order = idx.order;
            }
            if (idx.arrayConfig) {
              indexDef.arrayConfig = idx.arrayConfig;
            }
            return indexDef;
          });
        }

        if (override.ttl || override.indexes.length > 0) {
          fieldOverrides.push(override);
        }
      }
    }

    const indexesData = {
      indexes,
      fieldOverrides,
    };

    const indexesFilePath = path.join(process.cwd(), "firestore.indexes.json");
    fs.writeFileSync(
      indexesFilePath,
      JSON.stringify(indexesData, null, 2),
      "utf-8"
    );

    console.log(`✓ Firestore indexes saved to ${indexesFilePath}`);
  } catch (error: any) {
    console.error("Error pulling indexes:", error.message);
    throw error;
  }
}

async function pullRules(token: string) {
  try {
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
  const token = await getAccessToken();
  await pullIndexes(token);
  await pullRules(token);
})();
