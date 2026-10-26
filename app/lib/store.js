// v1 persistence: browser localStorage only. No accounts, no backend.
// Keys: hm_performances (array), hm_melodies (array), hm_likes (object id -> true).

export function loadStored(key) {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

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

export function addStored(key, item) {
  const items = loadStored(key);
  items.push(item);
  try {
    window.localStorage.setItem(key, JSON.stringify(items));
  } catch {
    /* storage unavailable */
  }
}

export function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}
