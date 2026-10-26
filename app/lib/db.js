// Server-side data layer for Hallel Muzikali (Vercel KV / Redis).
//
// Architecture (chosen for efficiency at this scale — no full-array
// rewrites, native Redis structures, one round trip per read):
//   perf:{id} / melody:{id}   JSON item (ownerId null = demo content)
//   perf:ids / melody:ids     SET of item ids
//   user:{id}                 JSON user (scrypt password hash + salt)
//   user:email:{email}        -> user id (lookup index)
//   session:{token}           JSON { userId } with native 30-day TTL
//   like:{itemId}             SET of user ids who liked it
//   meta:seeded               "1" once demo content was seeded into KV
//
// Displayed likes = stored item.likes (demo base) + size of like:{id}.
// One-time migration (first seed): old v1 keys hm_user_performances,
// hm_user_melodies and hm_like_counts are folded in, then deleted.

import { kv } from "@vercel/kv";
import { PERFORMANCES, MELODIES } from "./data";

const SESSION_TTL_SECONDS = 30 * 24 * 3600;

// ---------- items ----------

export async function listPerformances() {
  await ensureSeeded();
  const ids = await kv.smembers("perf:ids");
  if (!ids || ids.length === 0) return [];
  const items = await kv.mget(...ids.map((id) => `perf:${id}`));
  return items.filter(Boolean);
}

export async function listMelodies() {
  await ensureSeeded();
  const ids = await kv.smembers("melody:ids");
  if (!ids || ids.length === 0) return [];
  const items = await kv.mget(...ids.map((id) => `melody:${id}`));
  return items.filter(Boolean);
}

export async function addPerformance(item) {
  await kv.set(`perf:${item.id}`, item);
  await kv.sadd("perf:ids", item.id);
  return item;
}

export async function addMelody(item) {
  await kv.set(`melody:${item.id}`, item);
  await kv.sadd("melody:ids", item.id);
  return item;
}

export async function getItem(kind, id) {
  const prefix = kind === "melody" ? "melody" : "perf";
  return kv.get(`${prefix}:${id}`);
}

// Delete only by the owner (or demo items never: ownerId null = locked).
export async function deleteOwnItem(kind, id, userId) {
  const prefix = kind === "melody" ? "melody" : "perf";
  const item = await kv.get(`${prefix}:${id}`);
  if (!item) return { ok: false, status: 404 };
  if (!item.ownerId || item.ownerId !== userId) return { ok: false, status: 403 };
  await kv.del(`${prefix}:${id}`);
  await kv.srem(`${prefix}:ids`, id);
  await kv.del(`like:${id}`);
  return { ok: true, status: 200 };
}

// ---------- likes ----------

export async function likeCounts(ids) {
  if (!ids || ids.length === 0) return {};
  const sets = await Promise.all(ids.map((id) => kv.smembers(`like:${id}`)));
  const out = {};
  ids.forEach((id, i) => {
    out[id] = (sets[i] || []).length;
  });
  return out;
}

export async function likedByUser(userId, ids) {
  if (!userId || !ids || ids.length === 0) return {};
  const sets = await Promise.all(ids.map((id) => kv.smembers(`like:${id}`)));
  const out = {};
  ids.forEach((id, i) => {
    out[id] = (sets[i] || []).includes(userId);
  });
  return out;
}

// Toggle: returns { liked, likes } where likes = base + likers count.
export async function toggleLike(item, userId) {
  const key = `like:${item.id}`;
  const isMember = await kv.sismember(key, userId);
  if (isMember) await kv.srem(key, userId);
  else await kv.sadd(key, userId);
  const count = await kv.scard(key);
  return { liked: !isMember, likes: (item.likes || 0) + count };
}

// ---------- users & sessions ----------

export async function getUserByEmail(email) {
  const id = await kv.get(`user:email:${email}`);
  if (!id) return null;
  return kv.get(`user:${id}`);
}

export async function getUserById(id) {
  if (!id) return null;
  return kv.get(`user:${id}`);
}

export async function createUser(user) {
  await kv.set(`user:${user.id}`, user);
  await kv.set(`user:email:${user.email}`, user.id);
  return user;
}

export async function createSession(userId) {
  const token = [...crypto.getRandomValues(new Uint8Array(32))]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  await kv.set(`session:${token}`, { userId }, { ex: SESSION_TTL_SECONDS });
  return token;
}

export async function getSessionUser(token) {
  if (!token) return null;
  const session = await kv.get(`session:${token}`);
  if (!session || !session.userId) return null;
  return getUserById(session.userId);
}

export async function deleteSession(token) {
  if (token) await kv.del(`session:${token}`);
}

// ---------- seed + one-time migration ----------

let seedPromise = null;

export function ensureSeeded() {
  if (!seedPromise) seedPromise = seedOnce();
  return seedPromise;
}

async function seedOnce() {
  try {
    const seeded = await kv.get("meta:seeded");
    if (seeded) return;
    // Old v1 keys (arrays + absolute/delta like counts) — fold in.
    const oldPerfs = (await kv.get("hm_user_performances")) || [];
    const oldMelodies = (await kv.get("hm_user_melodies")) || [];
    const oldDeltas = (await kv.get("hm_like_counts")) || {};
    const fold = (items) =>
      items.map((it) => ({
        ...it,
        likes: Math.max(0, (it.likes || 0) + (oldDeltas[it.id] || 0)),
      }));
    const perfs = fold([...PERFORMANCES, ...oldPerfs]);
    const melodies = fold([...MELODIES, ...oldMelodies]);
    for (const p of perfs) {
      await kv.set(`perf:${p.id}`, { ...p, ownerId: null });
      await kv.sadd("perf:ids", p.id);
    }
    for (const m of melodies) {
      await kv.set(`melody:${m.id}`, { ...m, ownerId: null });
      await kv.sadd("melody:ids", m.id);
    }
    await kv.del("hm_user_performances", "hm_user_melodies", "hm_like_counts");
    await kv.set("meta:seeded", "1");
  } catch {
    // If KV is unavailable, reads fall back to demo content in callers.
  }
}
