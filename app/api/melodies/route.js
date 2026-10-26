import { NextResponse } from "next/server";
import { HALLEL_PARTS } from "../../lib/data";
import { addMelody, deleteOwnItem } from "../../lib/db";
import { currentUser } from "../../lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "יש להתחבר כדי להוסיף מנגינה." }, { status: 401 });
  }
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "גוף הבקשה אינו JSON תקין." }, { status: 400 });
  }
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "יש להזין שם שיר." }, { status: 400 });
  }
  const part = typeof body.part === "string" ? body.part : "קי״ג";
  const partName = (HALLEL_PARTS.find((p) => p.id === part) || {}).name || "";
  const item = {
    id: `m-user-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`,
    title,
    part,
    partName,
    chazzanId: null,
    chazzanName: user.name,
    tags: Array.isArray(body.tags) ? body.tags : [],
    likes: 0,
    scale: typeof body.scale === "string" ? body.scale : null,
    chords_mode: body.chords_mode === "plain_list" ? "plain_list" : "above_words",
    youtube_url: (typeof body.youtube_url === "string" && body.youtube_url.trim()) || null,
    plain_chords: Array.isArray(body.plain_chords) ? body.plain_chords : undefined,
    lines: Array.isArray(body.lines) ? body.lines : undefined,
    ownerId: user.id,
    ownerName: user.name,
  };
  if (item.chords_mode === "above_words" && (!item.lines || item.lines.length === 0)) {
    return NextResponse.json({ error: "יש להזין לפחות שורת מילים אחת." }, { status: 400 });
  }
  await addMelody(item);
  return NextResponse.json(item, { status: 201 });
}

export async function DELETE(req) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "יש להתחבר כדי למחוק." }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get("id") || "";
  const result = await deleteOwnItem("melody", id, user.id);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.status === 404 ? "המנגינה לא נמצאה." : "אפשר למחוק רק מנגינות שאתה הוספת." },
      { status: result.status }
    );
  }
  return NextResponse.json({ ok: true });
}
