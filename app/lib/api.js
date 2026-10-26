// Client-side API helpers. All shared data (items, likes, users,
// sessions) lives in Vercel KV behind /api/*.

export async function fetchSiteData() {
  const res = await fetch("/api/data", { cache: "no-store" });
  if (!res.ok) throw new Error("טעינת הנתונים נכשלה.");
  return res.json();
}

export async function fetchMe() {
  const res = await fetch("/api/auth/me", { cache: "no-store" });
  if (!res.ok) throw new Error("טעינת המשתמש נכשלה.");
  return res.json();
}

async function postJson(path, payload) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "הפעולה נכשלה.");
  return data;
}

async function deleteReq(path) {
  const res = await fetch(path, { method: "DELETE" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "המחיקה נכשלה.");
  return data;
}

export function registerUser(payload) {
  return postJson("/api/auth/register", payload);
}

export function loginUser(payload) {
  return postJson("/api/auth/login", payload);
}

export function logoutUser() {
  return postJson("/api/auth/logout", {});
}

export function postPerformance(payload) {
  return postJson("/api/performances", payload);
}

export function postMelody(payload) {
  return postJson("/api/melodies", payload);
}

export function toggleLike(id, kind) {
  return postJson("/api/likes", { id, kind });
}

export function deleteItem(kind, id) {
  const path = kind === "melody" ? "/api/melodies" : "/api/performances";
  return deleteReq(`${path}?id=${encodeURIComponent(id)}`);
}
