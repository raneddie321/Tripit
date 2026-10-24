// Google Identity Services & Auth State Management
import { getOAuthConfig, saveOAuthConfig } from "./config.js";

const AUTH_USER_KEY = "wandersquad_current_user";

// Default demo users to switch easily when testing friend groups
export const DEMO_USERS = [
  {
    id: "user_alex",
    name: "Alex Rivera",
    email: "alex.travels@example.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
    color: "#3b82f6"
  },
  {
    id: "user_sam",
    name: "Sam Chen",
    email: "sam.c@example.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
    color: "#10b981"
  },
  {
    id: "user_jordan",
    name: "Jordan Taylor",
    email: "jordan.t@example.com",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces",
    color: "#8b5cf6"
  }
];

let currentUser = loadSavedUser();
const authListeners = new Set();

function loadSavedUser() {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Error reading saved user", e);
  }
  // Default logged in as organizer Alex for seamless experience
  return DEMO_USERS[0];
}

export function getCurrentUser() {
  return currentUser;
}

export function setCurrentUser(user) {
  currentUser = user;
  try {
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  } catch (e) {
    console.warn("Storage error", e);
  }
  authListeners.forEach((fn) => fn(currentUser));
}

export function onAuthChange(fn) {
  authListeners.add(fn);
  fn(currentUser);
  return () => authListeners.delete(fn);
}

// Decode Google JWT payload
function decodeJwtPayload(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error("Failed to parse Google JWT", err);
    return null;
  }
}

// Initialize Google Identity Services
export function initGoogleAuth({ buttonContainerId, onLoginSuccess }) {
  const config = getOAuthConfig();
  const clientId = config.googleClientId.trim();

  // If window.google is ready and clientId is set
  if (window.google?.accounts?.id && clientId) {
    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          const payload = decodeJwtPayload(response.credential);
          if (payload) {
            const user = {
              id: "google_" + payload.sub,
              name: payload.name || payload.email.split("@")[0],
              email: payload.email,
              avatar: payload.picture || DEMO_USERS[0].avatar,
              color: "#3b82f6",
              isGoogle: true
            };
            setCurrentUser(user);
            if (onLoginSuccess) onLoginSuccess(user);
          }
        }
      });

      const container = document.getElementById(buttonContainerId);
      if (container) {
        container.innerHTML = "";
        window.google.accounts.id.renderButton(container, {
          theme: "filled_blue",
          size: "large",
          shape: "pill",
          text: "signin_with"
        });
      }
    } catch (err) {
      console.warn("Google GIS init error:", err);
    }
  }
}