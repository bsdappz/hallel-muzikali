// Demo data for Hallel Muzikali v1. Dates are illustrative and in the future
// relative to 2026-10-26. Real user additions are stored in localStorage
// (see store.js) and merged with this demo data at runtime.

export const CHAZZANIM = [
  { id: "david-cohen", name: "דוד כהן", bio: "חזן • 18 מנגינות" },
  { id: "yosef-levi", name: "יוסף לוי", bio: "חזן • 12 מנגינות" },
];

export const PERFORMANCES = [
  {
    id: "p-jerusalem-1",
    title: "הלל מוזיקלי — ירושלים, העיר העתיקה",
    date: "2026-11-19",
    time: "18:30",
    occasion: "ראש חודש כסלו",
    city: "ירושלים",
    synagogue: "בית הכנסת העתיק, הרובע היהודי",
    address: "רח׳ היהודים, הרובע היהודי, ירושלים",
    chazzanId: "david-cohen",
    chazzanName: "דוד כהן",
    likes: 132,
  },
  {
    id: "p-safed-1",
    title: "הלל מוזיקלי — צפת",
    date: "2026-12-06",
    time: "19:00",
    occasion: "חנוכה, נר שלישי",
    city: "צפת",
    synagogue: "בית כנסת האר״י",
    address: "רח׳ האר״י, צפת",
    chazzanId: "yosef-levi",
    chazzanName: "יוסף לוי",
    likes: 98,
  },
  {
    id: "p-hebron-1",
    title: "הלל מוזיקלי — מערת המכפלה, חברון",
    date: "2026-12-17",
    time: "18:00",
    occasion: "ראש חודש טבת",
    city: "חברון",
    synagogue: "מערת המכפלה",
    address: "מערת המכפלה, חברון",
    chazzanId: null,
    chazzanName: "הרב שמואל אליהו",
    likes: 210,
  },
  {
    id: "p-jerusalem-2",
    title: "הלל מוזיקלי — ירושלים",
    date: "2026-12-24",
    time: "18:30",
    occasion: "",
    city: "ירושלים",
    synagogue: "בית הכנסת המרכזי",
    address: "רח׳ יפו, ירושלים",
    chazzanId: "david-cohen",
    chazzanName: "דוד כהן",
    likes: 87,
  },
  {
    id: "p-jerusalem-3",
    title: "הלל מוזיקלי — ירושלים",
    date: "2027-01-14",
    time: "18:30",
    occasion: "ראש חודש שבט",
    city: "ירושלים",
    synagogue: "בית כנסת, שכונת קריית משה",
    address: "רח׳ קריית משה, ירושלים",
    chazzanId: null,
    chazzanName: "הרב שמואל אליהו",
    likes: 154,
  },
];

// A melody line: words array + chords map { wordIndex: chord }.
// chords_mode: "above_words" | "plain_list"
export const MELODIES = [
  {
    id: "m-hallelu",
    title: "הללו עבדי ה׳ — ניגון מסורתי",
    part: "קי״ג",
    partName: "הללו עבדי ה׳",
    chazzanId: "david-cohen",
    chazzanName: "דוד כהן",
    tags: ["חנוכה", "ראש חודש"],
    likes: 132,
    scale: "Am",
    chords_mode: "above_words",
    youtube_url: "https://www.youtube.com/results?search_query=%D7%94%D7%9C%D7%9C%D7%95+%D7%A2%D7%91%D7%93%D7%99+%D7%94",
    lines: [
      { words: ["הַלְלוּ", "עַבְדֵי", "ה׳", "הַלְלוּ", "אֶת", "שֵׁם", "ה׳"], chords: { 0: "Am", 3: "G" } },
      { words: ["יְהִי", "שֵׁם", "ה׳", "מְבֹרָךְ", "מֵעַתָּה", "וְעַד", "עוֹלָם"], chords: { 0: "Am", 4: "E" } },
      { words: ["מִמִּזְרַח", "שֶׁמֶשׁ", "עַד", "מְבוֹאוֹ", "מְהֻלָּל", "שֵׁם", "ה׳"], chords: { 0: "F", 4: "G", 6: "Am" } },
    ],
  },
  {
    id: "m-mimizrach",
    title: "ממזרח שמש — לחן חדש",
    part: "קי״ג",
    partName: "הללו עבדי ה׳",
    chazzanId: "yosef-levi",
    chazzanName: "יוסף לוי",
    tags: ["חנוכה"],
    likes: 98,
    scale: "C",
    chords_mode: "above_words",
    youtube_url: "https://www.youtube.com/results?search_query=%D7%9E%D7%9E%D7%96%D7%A8%D7%97+%D7%A9%D7%9E%D7%A9+%D7%94%D7%9C%D7%9C",
    lines: [
      { words: ["ממזרח", "שמש", "עד", "מבואו", "מהלל", "שם", "ה׳"], chords: { 0: "C", 4: "G" } },
      { words: ["רם", "על", "כל", "גוים", "ה׳"], chords: { 0: "F", 3: "C" } },
    ],
  },
  {
    id: "m-yehi",
    title: "יהי שם ה׳ מבורך",
    part: "קי״ג",
    partName: "הללו עבדי ה׳",
    chazzanId: "david-cohen",
    chazzanName: "דוד כהן",
    tags: ["ראש חודש"],
    likes: 76,
    scale: "Am",
    chords_mode: "above_words",
    youtube_url: "https://www.youtube.com/results?search_query=%D7%99%D7%94%D7%99+%D7%A9%D7%9D+%D7%94+%D7%9E%D7%91%D7%95%D7%A8%D7%9A",
    lines: [
      { words: ["יהי", "שם", "ה׳", "מבורך"], chords: { 0: "Am", 2: "E" } },
      { words: ["מעתה", "ועד", "עולם"], chords: { 0: "F", 2: "G" } },
    ],
  },
  {
    id: "m-hodu",
    title: "הודו לה׳ כי טוב",
    part: "קי״ח",
    partName: "הודו לה׳ כי טוב",
    chazzanId: "yosef-levi",
    chazzanName: "יוסף לוי",
    tags: ["פסח", "סוכות"],
    likes: 65,
    scale: "C",
    chords_mode: "above_words",
    youtube_url: "https://www.youtube.com/results?search_query=%D7%94%D7%95%D7%93%D7%95+%D7%9C%D7%94+%D7%9B%D7%99+%D7%98%D7%95%D7%91+%D7%94%D7%9C%D7%9C",
    lines: [
      { words: ["הודו", "לה׳", "כי", "טוב"], chords: { 0: "C", 2: "G" } },
      { words: ["כי", "לעולם", "חסדו"], chords: { 0: "Am", 1: "F" } },
    ],
  },
];

export const HALLEL_PARTS = [
  { id: "קי״ג", name: "הללו עבדי ה׳" },
  { id: "קי״ד", name: "בצאת ישראל ממצרים" },
  { id: "קט״ו", name: "לא לנו ה׳ לא לנו" },
  { id: "קט״ז", name: "אהבתי כי ישמע ה׳" },
  { id: "קי״ז", name: "הללו את ה׳ כל גוים" },
  { id: "קי״ח", name: "הודו לה׳ כי טוב" },
];

export const YEAR_TAGS = ["חנוכה", "פורים", "פסח", "סוכות", "ראש חודש"];

export function mapsUrl(performance) {
  const q = encodeURIComponent(`${performance.synagogue}, ${performance.address}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function formatDate(iso) {
  try {
    return new Date(iso + "T12:00:00").toLocaleDateString("he-IL", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

// Today as an ISO date string in the browser's local timezone.
export function todayIso() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
