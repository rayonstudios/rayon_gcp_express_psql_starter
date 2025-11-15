import tsoaConfig from "#/tsoa.json";

// General
const getEnvSuffix = () => {
  if (process.env.NODE_ENV === "dev") return " (Dev)";
  if (process.env.NODE_ENV === "test") return " (Test)";
  return "";
};

export const APP_TITLE = `Rayon GCP Express PSQL Starter${getEnvSuffix()}`;
export const PORT = process.env.PORT || 3000;
export const THEME_COLOR = "#DAA520";

// API
export const ROUTES_BASE_PATH = tsoaConfig.routes.basePath;

// URLs
const getFeUrl = () => {
  if (process.env.NODE_ENV === "production")
    return "https://fe.starters.rayonstudios.com/";
  if (process.env.NODE_ENV === "test")
    return "https://rayon-gcp-starter-test.web.app/";
  return "https://rayon-gcp-starter-dev.web.app/";
};

const getBeUrl = () => {
  if (process.env.NODE_ENV === "production") {
    return `https://be.starters.rayonstudios.com/${ROUTES_BASE_PATH}`;
  }
  if (process.env.NODE_ENV === "test") {
    return `https://rayon-gcp-express-psql-starter-test-227506371134.us-east1.run.app/${ROUTES_BASE_PATH}`;
  }
  return `https://rayon-gcp-express-psql-starter-dev-227506371134.us-east1.run.app/${ROUTES_BASE_PATH}`;
};

export const FE_URL = getFeUrl();
export const BE_URL = getBeUrl();

export const FIREBASE_AUTH_ENABLED =
  process.env.FIREBASE_AUTH_ENABLED === "true";
