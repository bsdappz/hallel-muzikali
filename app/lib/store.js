// Per-browser UI state only: which items THIS browser marked as liked.
// Shared content (performances, melodies, like counts) lives in Vercel KV
// behind /api/* — see lib/api.js and lib/db.js.

export function loadLikes() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem("hm_likes") || "{}") || {};
  } catch {
    return {};
  }
}

export function saveLikes(likes) {
  try {
    window.localStorage.setItem("hm_likes", JSON.stringify(likes));
  } catch {
    /* storage unavailable — likes just won't persist */
  }
}
