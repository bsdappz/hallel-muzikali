// Social login (Google, Facebook) via plain OAuth2 — no extra dependency.
// Flow: /api/auth/<provider> redirects to the provider; the provider
// redirects back to /api/auth/<provider>/callback, which exchanges the
// code, reads the profile email, finds-or-creates the KV user by email,
// and sets the SAME hm_session cookie as password login. So OAuth users
// and password users are one account system (linked by email).
//
// Required env vars (Vercel project settings, Production):
//   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
//   FACEBOOK_CLIENT_ID, FACEBOOK_CLIENT_SECRET
// Redirect URIs to register in each provider console:
//   <site>/api/auth/google/callback
//   <site>/api/auth/facebook/callback
// A provider whose vars are missing is simply not offered on the
// login/register pages (see /api/auth/providers).

import { randomBytes } from "node:crypto";

export const OAUTH_STATE_COOKIE = "hm_oauth_state";

const PROVIDERS = {
  google: {
    label: "Google",
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    profileUrl: "https://www.googleapis.com/oauth2/v3/userinfo",
    scope: "openid email profile",
    idEnv: "GOOGLE_CLIENT_ID",
    secretEnv: "GOOGLE_CLIENT_SECRET",
  },
  facebook: {
    label: "Facebook",
    authUrl: "https://www.facebook.com/v18.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v18.0/oauth/access_token",
    profileUrl: "https://graph.facebook.com/me?fields=id,name,email",
    scope: "email,public_profile",
    idEnv: "FACEBOOK_CLIENT_ID",
    secretEnv: "FACEBOOK_CLIENT_SECRET",
  },
};

export function providerNames() {
  return Object.keys(PROVIDERS);
}

export function providerConfig(name) {
  return PROVIDERS[name] || null;
}

export function providerConfigured(name) {
  const cfg = PROVIDERS[name];
  if (!cfg) return false;
  return Boolean(process.env[cfg.idEnv] && process.env[cfg.secretEnv]);
}

export function configuredProviders() {
  const out = {};
  for (const name of providerNames()) out[name] = providerConfigured(name);
  return out;
}

// Base URL of this deployment (redirect_uri must match exactly what is
// registered in the provider console).
export function siteBaseUrl(req) {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const proto = req.headers.get("x-forwarded-proto") || "https";
  return host ? `${proto}://${host}` : "https://hallel-muzikali.vercel.app";
}

export function callbackUrl(req, provider) {
  return `${siteBaseUrl(req)}/api/auth/${provider}/callback`;
}

export function newState() {
  return randomBytes(16).toString("hex");
}

export function authRedirectUrl(req, provider) {
  const cfg = PROVIDERS[provider];
  const params = new URLSearchParams({
    client_id: process.env[cfg.idEnv],
    redirect_uri: callbackUrl(req, provider),
    response_type: "code",
    scope: cfg.scope,
    state: newState(),
  });
  return { url: `${cfg.authUrl}?${params.toString()}`, state: params.get("state") };
}

async function exchangeCode(provider, req, code) {
  const cfg = PROVIDERS[provider];
  const body = new URLSearchParams({
    client_id: process.env[cfg.idEnv],
    client_secret: process.env[cfg.secretEnv],
    redirect_uri: callbackUrl(req, provider),
    code,
    grant_type: "authorization_code",
  });
  const res = await fetch(cfg.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || data.error?.message || "החלפת הקוד נכשלה.");
  }
  return data.access_token;
}

export async function fetchProfile(provider, accessToken) {
  const cfg = PROVIDERS[provider];
  const res = await fetch(cfg.profileUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error?.message || "קריאת הפרופיל נכשלה.");
  const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  const name = typeof data.name === "string" ? data.name.trim() : "";
  if (!email) throw new Error("הספק לא החזיר כתובת מייל — אי אפשר ליצור חשבון בלעדיה.");
  return { email, name: name || email.split("@")[0], providerId: String(data.id || "") };
}

// Full callback handling shared by both providers: returns { email, name, providerId }.
export async function handleCallback(provider, req, code) {
  const token = await exchangeCode(provider, req, code);
  return fetchProfile(provider, token);
}
