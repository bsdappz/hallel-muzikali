import { NextResponse } from "next/server";
import { listPerformances, listMelodies, likeCounts, likedByUser } from "../../lib/db";
import { currentUser } from "../../lib/auth";
import { PERFORMANCES, MELODIES } from "../../lib/data";

export const dynamic = "force-dynamic";

// One round trip for every page: all items from KV (demo seeded on first
// call) with displayed likes = stored base + likers count, plus the
// current user's liked flags and identity (null when logged out).
export async function GET() {
  const [performances, melodies, user] = await Promise.all([
    listPerformances().catch(() => PERFORMANCES),
    listMelodies().catch(() => MELODIES),
    currentUser().catch(() => null),
  ]);
  const allIds = [...performances, ...melodies].map((it) => it.id);
  const counts = await likeCounts(allIds).catch(() => ({}));
  const liked = await likedByUser(user?.id, allIds).catch(() => ({}));
  const withLikes = (items) =>
    items.map((it) => ({
      ...it,
      likes: (it.likes || 0) + (counts[it.id] || 0),
      liked: !!liked[it.id],
    }));
  return NextResponse.json({
    user,
    performances: withLikes(performances),
    melodies: withLikes(melodies),
  });
}
