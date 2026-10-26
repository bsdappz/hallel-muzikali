import { NextResponse } from "next/server";
import { adjustLikeCount } from "../../lib/db";

export const dynamic = "force-dynamic";

// Body: { id, delta } with delta +1 (like) or -1 (unlike).
export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "גוף הבקשה אינו JSON תקין." }, { status: 400 });
  }
  const id = typeof body.id === "string" ? body.id : "";
  const delta = body.delta === -1 ? -1 : 1;
  if (!id) {
    return NextResponse.json({ error: "חסר מזהה פריט." }, { status: 400 });
  }
  const count = await adjustLikeCount(id, delta);
  return NextResponse.json({ id, likes: count });
}
