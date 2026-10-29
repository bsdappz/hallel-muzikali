// Shared server logic for the OAuth start/callback routes. Each provider
// gets two thin route files that call these with its name.

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  providerConfig,
  providerConfigured,
  authRedirectUrl,
  handleCallback,
  OAUTH_STATE_COOKIE,
} from "../lib/oauth";
import { getUserByEmail, createUser, updateUser, createSession } from "../lib/db";
import { sessionCookieOptions, SESSION_COOKIE } from "../lib/auth";

function errorPage(message) {
  return new NextResponse(
    `<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="utf-8"><title>שגיאת התחברות</title></head>` +
      `<body style="font-family:system-ui;text-align:center;padding:40px">` +
      `<h1>ההתחברות נכשלה</h1><p>${message}</p>` +
      `<p><a href="/login">חזרה להתחברות</a></p></body></html>`,
    { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

export async function startRoute(provider, req) {
  const cfg = providerConfig(provider);
  if (!cfg) return errorPage("ספק התחברות לא מוכר.");
  if (!providerConfigured(provider)) {
    return errorPage(`התחברות עם ${cfg.label} עדיין לא הופעלה באתר — מפתחות ה־OAuth טרם הוגדרו.`);
  }
  const { url, state } = authRedirectUrl(req, provider);
  const res = NextResponse.redirect(url);
  res.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60,
  });
  return res;
}

export async function callbackRoute(provider, req) {
  const cfg = providerConfig(provider);
  if (!cfg) return errorPage("ספק התחברות לא מוכר.");
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const store = await cookies();
  const savedState = store.get(OAUTH_STATE_COOKIE)?.value;
  if (!code || !state || !savedState || state !== savedState) {
    return errorPage("אימות הבקשה נכשל (state לא תואם). נסה שוב.");
  }
  let profile;
  try {
    profile = await handleCallback(provider, req, code);
  } catch (e) {
    return errorPage(e.message || "ההתחברות נכשלה.");
  }
  // Find-or-create by email: an existing password user keeps their
  // password; the OAuth provider is linked onto the same account.
  let user = await getUserByEmail(profile.email);
  if (!user) {
    user = {
      id: `u-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`,
      name: profile.name,
      email: profile.email,
      providers: { [provider]: profile.providerId },
      createdAt: new Date().toISOString(),
    };
    await createUser(user);
  } else if (!user.providers || !user.providers[provider]) {
    user = { ...user, providers: { ...(user.providers || {}), [provider]: profile.providerId } };
    try {
      await updateUser(user);
    } catch {}
  }
  const token = await createSession(user.id);
  const res = NextResponse.redirect(new URL("/", req.url));
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  res.cookies.set(OAUTH_STATE_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
