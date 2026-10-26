import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteSession } from "../../../lib/db";
import { SESSION_COOKIE } from "../../../lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  await deleteSession(token);
  const res = NextResponse.json({ ok: true });
  store.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
