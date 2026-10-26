// Server-side data access for Hallel Muzikali (Vercel KV).
// Demo content lives in lib/data.js; everything users add, plus like
// counts, lives in KV so it is shared across all visitors.
// Keys: hm_user_performances (array), hm_user_melodies (array),
// hm_like_counts (object id -> absolute count).

import { kv } from "@vercel/kv";

export async function getUserPerformances() {
  try {
    const items = await kv.get("hm_user_performances");
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export async function getUserMelodies() {
  try {
    const items = await kv.get("hm_user_melodies");
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export async function getLikeCounts() {
  try {
    const counts = await kv.get("hm_like_counts");
    return counts && typeof counts === "object" ? counts : {};
  } catch {
    return {};
  }
}

export async function addUserPerformance(item) {
  const items = await getUserPerformances();
  items.push(item);
  await kv.set("hm_user_performances", items);
  return item;
}

export async function addUserMelody(item) {
  const items = await getUserMelodies();
  items.push(item);
  await kv.set("hm_user_melodies", items);
  return item;
}

// Adjust an item's absolute like count by delta (+1 / -1), never below 0.
export async function adjustLikeCount(id, delta) {
  const counts = await getLikeCounts();
  const next = Math.max(0, (counts[id] || 0) + delta);
  counts[id] = next;
  await kv.set("hm_like_counts", counts);
  return next;
}
