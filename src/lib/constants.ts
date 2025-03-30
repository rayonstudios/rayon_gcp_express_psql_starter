import { isDevEnv } from "#/src/lib/utils";

// General
export const APP_TITLE = `Rayon GCP Express PSQL Starter${isDevEnv() ? " (Dev)" : ""}`;
export const PORT = process.env.PORT || 3000;
export const THEME_COLOR = "#DAA520";

// URLs
export const FE_URL = isDevEnv()
  ? "https://rayon-react-starter-dev.web.app/"
  : "https://rayon-react-starter.web.app/";

export const BE_URL = isDevEnv()
  ? "https://rayon-gcp-starter.ue.r.appspot.com"
  : "https://rayon-gcp-starter.ue.r.appspot.com";
