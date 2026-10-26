import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserByEmail, createSession } from "../../../lib/db";
import { verifyPassword, publicUser, sessionCookieOptions, SESSION_COOKIE } from "../../../lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "גוף הבקשה אינו JSON תקין." }, { status: 400 });
  }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const user = await getUserByEmail(email);
  if (!user || !verifyPassword(password, user.passSalt, user.passHash)) {
    return NextResponse.json({ error: "מייל או סיסמה שגויים." }, { status: 401 });
  }
  const token = await createSession(user.id);
  const res = NextResponse.json(publicUser(user));
  const store = await cookies();
  store.set(SESSION_COOKIE, token, sessionCookieOptions());
  return res;
}
