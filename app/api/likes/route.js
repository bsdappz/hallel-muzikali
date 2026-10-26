import { NextResponse } from "next/server";
import { getItem, toggleLike } from "../../lib/db";
import { currentUser } from "../../lib/auth";

export const dynamic = "force-dynamic";

// Toggle the current user's like. Body: { id, kind } with kind
// "perf" or "melody". Returns { liked, likes } (displayed count).
export async function POST(req) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "יש להתחבר כדי לסמן אהבתי." }, { status: 401 });
  }
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "גוף הבקשה אינו JSON תקין." }, { status: 400 });
  }
  const id = typeof body.id === "string" ? body.id : "";
  const kind = body.kind === "melody" ? "melody" : "perf";
  if (!id) {
    return NextResponse.json({ error: "חסר מזהה פריט." }, { status: 400 });
  }
  const item = await getItem(kind, id);
  if (!item) {
    return NextResponse.json({ error: "הפריט לא נמצא." }, { status: 404 });
  }
  const result = await toggleLike(item, user.id);
  return NextResponse.json({ id, liked: result.liked, likes: result.likes });
}
