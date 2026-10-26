// Chord-bar logic for Design A (chosen chords editor).
// Bar = (1) the scale's common chords + (2) common chords from OUTSIDE the scale.
// Exotic/precise chords (maj7, dim, aug, ...) NEVER appear in the bar — search only.
import dict from "./chord-scales.json";

export const DEFAULT_SCALE = dict.default_scale || "Am";

// Natural-minor v chord (the minor v is rarely used in songs, so the bar
// shows the scale's diatonic chords minus dim, plus this familiar minor v).
const NATURAL_MINOR_V = {
  Am: "Em",
  Em: "Bm",
  Dm: "Am",
  Gm: "Dm",
  Cm: "Gm",
  Bm: "F#m",
  "F#m": "C#m",
};

export function scaleKind(scale) {
  if (dict.minor && dict.minor[scale]) return "minor";
  return "major";
}

export function scaleChords(scale) {
  const kind = scaleKind(scale);
  const all = (dict[kind] && dict[kind][scale]) || [];
  const common = all.filter((c) => !c.endsWith("dim"));
  if (kind === "minor") {
    const v = NATURAL_MINOR_V[scale];
    if (v && !common.includes(v)) common.push(v);
  }
  return common;
}

export function outsideChords(scale) {
  const kind = scaleKind(scale);
  return (dict.common_outside && dict.common_outside[kind] && dict.common_outside[kind][scale]) || [];
}

export function allScales() {
  return [...Object.keys(dict.major || {}), ...Object.keys(dict.minor || {})];
}

// Search pool: every dictionary chord + the precision examples.
// The user may also type ANY chord freely — the panel always offers the
// exact typed value as a choice.
export function searchChords(query) {
  const q = query.trim().toLowerCase();
  const pool = new Set();
  for (const kind of ["major", "minor"]) {
    for (const scale of Object.keys(dict[kind] || {})) {
      for (const c of dict[kind][scale]) pool.add(c);
    }
    for (const scale of Object.keys((dict.common_outside && dict.common_outside[kind]) || {})) {
      for (const c of dict.common_outside[kind][scale]) pool.add(c);
    }
  }
  for (const c of dict.search_only_examples || []) pool.add(c);
  const all = [...pool];
  if (!q) return all;
  return all.filter((c) => c.toLowerCase().includes(q));
}
