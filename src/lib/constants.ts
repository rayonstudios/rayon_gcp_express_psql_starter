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
    return "https://fe.test.starters.rayonstudios.com/";
  return "https://fe.dev.starters.rayonstudios.com/";
};

const getBeUrl = () => {
  if (process.env.NODE_ENV === "production") {
    return `https://be.starters.rayonstudios.com/${ROUTES_BASE_PATH}`;
  }
  if (process.env.NODE_ENV === "test") {
    return `https://be.test.starters.rayonstudios.com/${ROUTES_BASE_PATH}`;
  }
  return `https://be.dev.starters.rayonstudios.com/${ROUTES_BASE_PATH}`;
};

export const FE_URL = getFeUrl();
export const BE_URL = getBeUrl();
