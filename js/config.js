// WanderSquad Google OAuth and App Configuration
// Store keys locally or load from environment
const STORAGE_CONFIG_KEY = "wandersquad_oauth_config";

export function getOAuthConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_CONFIG_KEY) || "{}");
    return {
      googleClientId: saved.googleClientId || "",
      googleClientSecret: saved.googleClientSecret || ""
    };
  } catch {
    return { googleClientId: "", googleClientSecret: "" };
  }
}

export function saveOAuthConfig(config) {
  try {
    localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(config));
    return true;
  } catch (err) {
    console.warn("Could not save OAuth config", err);
    return false;
  }
}