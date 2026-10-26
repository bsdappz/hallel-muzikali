// Client-side API helpers. All shared data lives in Vercel KV behind
// /api/*; only the per-browser "did I like this" marker stays local
// (see lib/store.js) because there is no login/identity yet.

export async function fetchSiteData() {
  const res = await fetch("/api/data", { cache: "no-store" });
  if (!res.ok) throw new Error("טעינת הנתונים נכשלה.");
  return res.json();
}

async function postJson(path, payload) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "השמירה נכשלה.");
  return data;
}

export function postPerformance(payload) {
  return postJson("/api/performances", payload);
}

export function postMelody(payload) {
  return postJson("/api/melodies", payload);
}

// Best-effort: callers update the UI optimistically and revert on failure.
export function postLike(id, delta) {
  return postJson("/api/likes", { id, delta });
}
