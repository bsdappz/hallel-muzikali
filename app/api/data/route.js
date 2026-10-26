import { NextResponse } from "next/server";
import { PERFORMANCES, MELODIES } from "../../lib/data";
import { getUserPerformances, getUserMelodies, getLikeCounts } from "../../lib/db";

export const dynamic = "force-dynamic";

// One round trip for every page: demo content + user additions from KV,
// with like counts = demo base + KV delta (user additions have base 0).
export async function GET() {
  const [userPerformances, userMelodies, likeCounts] = await Promise.all([
    getUserPerformances(),
    getUserMelodies(),
    getLikeCounts(),
  ]);
  const withLikes = (items) =>
    items.map((it) => ({
      ...it,
      likes: Math.max(0, (it.likes || 0) + (likeCounts[it.id] || 0)),
    }));
  return NextResponse.json({
    performances: withLikes([...PERFORMANCES, ...userPerformances]),
    melodies: withLikes([...MELODIES, ...userMelodies]),
  });
}
