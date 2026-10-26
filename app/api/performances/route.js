import { NextResponse } from "next/server";
import { addPerformance, deleteOwnItem } from "../../lib/db";
import { currentUser } from "../../lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "יש להתחבר כדי להוסיף תפילה." }, { status: 401 });
  }
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "גוף הבקשה אינו JSON תקין." }, { status: 400 });
  }
  const date = typeof body.date === "string" ? body.date : "";
  const time = typeof body.time === "string" ? body.time : "";
  const synagogue = typeof body.synagogue === "string" ? body.synagogue.trim() : "";
  const address = typeof body.address === "string" ? body.address.trim() : "";
  if (!date || !time || !synagogue || !address) {
    return NextResponse.json(
      { error: "יש למלא את כל שדות החובה: תאריך, שעת תפילה, שם בית כנסת וכתובת מדויקת." },
      { status: 400 }
    );
  }
  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate()
  ).padStart(2, "0")}`;
  if (date < todayIso) {
    return NextResponse.json({ error: "התאריך שבחרת כבר עבר." }, { status: 400 });
  }
  const item = {
    id: `p-user-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`,
    title: `הלל מוזיקלי — ${synagogue}`,
    date,
    time,
    occasion: "",
    city: (typeof body.city === "string" && body.city.trim()) || "—",
    synagogue,
    address,
    chazzanId: null,
    chazzanName: (typeof body.chazzan === "string" && body.chazzan.trim()) || user.name,
    likes: 0,
    ownerId: user.id,
    ownerName: user.name,
  };
  await addPerformance(item);
  return NextResponse.json(item, { status: 201 });
}

export async function DELETE(req) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "יש להתחבר כדי למחוק." }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get("id") || "";
  const result = await deleteOwnItem("perf", id, user.id);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.status === 404 ? "התפילה לא נמצאה." : "אפשר למחוק רק תפילות שאתה הוספת." },
      { status: result.status }
    );
  }
  return NextResponse.json({ ok: true });
}
