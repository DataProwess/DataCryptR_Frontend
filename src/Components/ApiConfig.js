/**
 * API and SPA base URLs from Create React App env (REACT_APP_*).
 * Set REACT_APP_API_URL and REACT_APP_FRONTEND_URL in .env — see .env.example.
 * Values are injected at build time; restart the dev server or rebuild after changes.
 */

const DEFAULT_API_URL = "http://localhost:8000";
const DEFAULT_FRONTEND_URL = "http://localhost:3000";

function baseUrlFromEnv(varName, fallback) {
  const raw = process.env[varName];
  const chosen =
    typeof raw === "string" && raw.trim() !== "" ? raw.trim() : fallback;
  return chosen.replace(/\/+$/, "");
}

export const API_URL = baseUrlFromEnv("REACT_APP_API_URL", DEFAULT_API_URL);
export const FRONTEND_API_URL = baseUrlFromEnv(
  "REACT_APP_FRONTEND_URL",
  DEFAULT_FRONTEND_URL
);
