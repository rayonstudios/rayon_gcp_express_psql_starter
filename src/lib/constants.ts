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
  ? "https://rayon-react-starter-dev.web.app/"
  : "https://rayon-react-starter.web.app/";

export const BE_URL = isDevEnv()
  ? `https://rayon-gcp-starter.ue.r.appspot.com${ROUTES_BASE_PATH}`
  : `https://rayon-gcp-starter.ue.r.appspot.com${ROUTES_BASE_PATH}`;
