import { isAppEngine, isDevEnv } from "#/src/lib/utils";

// General
export const APP_TITLE = `Rayon React Starter${isDevEnv() ? " (Dev)" : ""}`;
export const PORT = process.env.PORT || 5000;
export const THEME_COLOR = "#DAA520";

// URLs
export const FE_URL = !isAppEngine()
  ? "http://localhost:5173"
  : isDevEnv()
    ? "https://rayon-react-starter-dev.web.app/"
    : "https://rayon-react-starter.web.app/";

export const BE_URL = !isAppEngine()
  ? `http://localhost:${PORT}`
  : isDevEnv()
    ? "https://compact-flash-306512.el.r.appspot.com"
    : "https://compact-flash-306512.el.r.appspot.com";
