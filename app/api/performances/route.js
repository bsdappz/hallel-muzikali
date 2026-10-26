import { NextResponse } from "next/server";
import { addUserPerformance } from "../../lib/db";

export const dynamic = "force-dynamic";

export async function POST(req) {
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
    chazzanName: (typeof body.chazzan === "string" && body.chazzan.trim()) || "—",
    likes: 0,
  };
  await addUserPerformance(item);
  return NextResponse.json(item, { status: 201 });
}
