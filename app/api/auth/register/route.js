import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserByEmail, createUser, createSession } from "../../../lib/db";
import { hashPassword, publicUser, sessionCookieOptions, SESSION_COOKIE } from "../../../lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "גוף הבקשה אינו JSON תקין." }, { status: 400 });
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!name || !email || !email.includes("@")) {
    return NextResponse.json({ error: "יש להזין שם וכתובת מייל תקינה." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "הסיסמה חייבת להיות באורך 6 תווים לפחות." }, { status: 400 });
  }
  const existing = await getUserByEmail(email);
  if (existing) {
    return NextResponse.json({ error: "כתובת המייל כבר רשומה. נסה להתחבר." }, { status: 409 });
  }
  const { salt, hash } = hashPassword(password);
  const user = {
    id: `u-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`,
    name,
    email,
    passSalt: salt,
    passHash: hash,
    createdAt: new Date().toISOString(),
  };
  await createUser(user);
  const token = await createSession(user.id);
  const res = NextResponse.json(publicUser(user), { status: 201 });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, sessionCookieOptions());
  return res;
}
