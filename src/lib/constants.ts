import { isAppEngine, isDevEnv } from "#/src/lib/utils";

// General
export const APP_TITLE = `Rayon React Starter${isDevEnv() ? " (Dev)" : ""}`;
export const PORT = process.env.PORT || 3000;

// URLs
export const FE_URL = !isAppEngine()
  ? "http://localhost:5173"
  : isDevEnv()
  ? "https://checkout.dev.physikomatics.com"
  : "https://checkout.physikomatics.com";
export const BE_URL = !isAppEngine()
  ? `http://localhost:${PORT}`
  : isDevEnv()
  ? "https://api.dev.physikomatics.com"
  : "https://api.physikomatics.com";
