import { NextResponse } from "next/server";
import { PERFORMANCES, MELODIES } from "../../lib/data";
import { getUserPerformances, getUserMelodies, getLikeCounts } from "../../lib/db";

export const dynamic = "force-dynamic";

// One round trip for every page: demo content + user additions from KV,
// with like counts overlaid (KV count wins when present, else demo count).
export async function GET() {
  const [userPerformances, userMelodies, likeCounts] = await Promise.all([
    getUserPerformances(),
    getUserMelodies(),
    getLikeCounts(),
  ]);
  const withLikes = (items) =>
    items.map((it) => ({
      ...it,
      likes: likeCounts[it.id] !== undefined ? likeCounts[it.id] : it.likes || 0,
    }));
  return NextResponse.json({
    performances: withLikes([...PERFORMANCES, ...userPerformances]),
    melodies: withLikes([...MELODIES, ...userMelodies]),
  });
}
