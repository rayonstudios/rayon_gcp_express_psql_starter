import { isDevEnv } from "#/src/lib/utils";
import tsoaConfig from "#/tsoa.json";

// General
export const APP_TITLE = `Rayon GCP Express PSQL Starter${isDevEnv() ? " (Dev)" : ""}`;
export const PORT = process.env.PORT || 3000;
export const THEME_COLOR = "#DAA520";

// API
export const ROUTES_BASE_PATH = tsoaConfig.routes.basePath;

// URLs
export const FE_URL = isDevEnv()
  ? "https://fe.starters.rayonstudios.com/"
  : "https://fe.starters.rayonstudios.com/";

export const BE_URL = isDevEnv()
  ? `https://be.starters.rayonstudios.com/${ROUTES_BASE_PATH}`
  : `https://be.starters.rayonstudios.com/${ROUTES_BASE_PATH}`;
