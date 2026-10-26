import { NextResponse } from "next/server";
import { HALLEL_PARTS } from "../../lib/data";
import { addUserMelody } from "../../lib/db";

export const dynamic = "force-dynamic";

export async function POST(req) {
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
    chazzanName: "את/ה",
    tags: Array.isArray(body.tags) ? body.tags : [],
    likes: 0,
    scale: typeof body.scale === "string" ? body.scale : null,
    chords_mode: body.chords_mode === "plain_list" ? "plain_list" : "above_words",
    youtube_url: (typeof body.youtube_url === "string" && body.youtube_url.trim()) || null,
    plain_chords: Array.isArray(body.plain_chords) ? body.plain_chords : undefined,
    lines: Array.isArray(body.lines) ? body.lines : undefined,
  };
  if (item.chords_mode === "above_words" && (!item.lines || item.lines.length === 0)) {
    return NextResponse.json({ error: "יש להזין לפחות שורת מילים אחת." }, { status: 400 });
  }
  await addUserMelody(item);
  return NextResponse.json(item, { status: 201 });
}
