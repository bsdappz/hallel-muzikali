// Server-side auth helpers. Passwords: scrypt + random salt, compared
// with timingSafeEqual. Sessions: random token in an httpOnly cookie,
// stored in KV with a native 30-day TTL (see lib/db.js).

import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getSessionUser } from "./db";

export const SESSION_COOKIE = "hm_session";

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

export function verifyPassword(password, salt, hash) {
  try {
    const attempt = scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, "hex");
    return attempt.length === expected.length && timingSafeEqual(attempt, expected);
  } catch {
    return false;
  }
}

export function publicUser(user) {
  if (!user) return null;
  return { id: user.id, name: user.name, email: user.email };
}

export async function currentUser() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const user = await getSessionUser(token);
  return publicUser(user);
}

export async function currentUserWithToken() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const user = await getSessionUser(token);
  return { user: publicUser(user), token };
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 3600,
  };
}
