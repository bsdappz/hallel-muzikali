"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { HALLEL_PARTS, YEAR_TAGS } from "../lib/data";
import { DEFAULT_SCALE, allScales, scaleChords, outsideChords, searchChords } from "../lib/chords";
import { addStored, uid } from "../lib/store";

const DEFAULT_LINES_TEXT =
  "הללו עבדי ה׳ הללו את שם ה׳\nיהי שם ה׳ מבורך מעתה ועד עולם\nממזרח שמש עד מבואו מהלל שם ה׳";

export default function AddMelodyPage() {
  const router = useRouter();
  const [part, setPart] = useState("קי״ג");
  const [songName, setSongName] = useState("");
  const [scale, setScale] = useState(DEFAULT_SCALE);
  const [tags, setTags] = useState([]);
  const [mode, setMode] = useState("above_words");
  const [linesText, setLinesText] = useState(DEFAULT_LINES_TEXT);
  const [plainText, setPlainText] = useState("");
  const [youtube, setYoutube] = useState("");
  const [chords, setChords] = useState([{}, {}, {}]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const lines = useMemo(
    () =>
      linesText
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => l.split(/\s+/)),
    [linesText]
  );

  const onLinesTextChange = (text) => {
    setLinesText(text);
    const count = text.split("\n").map((l) => l.trim()).filter(Boolean).length;
    setChords((prev) => {
      const next = [...prev];
      while (next.length < count) next.push({});
      return next.slice(0, count);
    });
    setSelected(null);
  };

  const toggleTag = (t) => setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const applyChord = (chord) => {
    if (!selected) {
      setError("גע קודם במילה שבה האקורד מתחלף, ואז באקורד.");
      return;
    }
    setError("");
    setChords((prev) => {
      const next = [...prev];
      next[selected.li] = { ...(next[selected.li] || {}), [selected.wi]: chord };
      return next;
    });
    setSearch("");
    setSelected(null);
  };

  const removeChord = () => {
    if (!selected) return;
    setChords((prev) => {
      const next = [...prev];
      const line = { ...(next[selected.li] || {}) };
      delete line[selected.wi];
      next[selected.li] = line;
      return next;
    });
    setSelected(null);
  };

  const publish = () => {
    if (!songName.trim()) {
      setError("יש להזין שם שיר.");
      return;
    }
    if (mode === "above_words" && lines.length === 0) {
      setError("יש להזין לפחות שורת מילים אחת.");
      return;
    }
    const partName = (HALLEL_PARTS.find((p) => p.id === part) || {}).name || "";
    const melody = {
      id: uid("m-user"),
      title: songName.trim(),
      part,
      partName,
      chazzanId: null,
      chazzanName: "את/ה",
      tags,
      likes: 0,
      scale,
      chords_mode: mode,
      youtube_url: youtube.trim() || null,
    };
    if (mode === "plain_list") {
      melody.plain_chords = plainText.split(/[,،\s]+/).map((c) => c.trim()).filter(Boolean);
    } else {
      melody.lines = lines.map((words, li) => ({ words, chords: chords[li] || {} }));
    }
    addStored("hm_melodies", melody);
    router.push("/melodies");
  };

  const searchResults = search.trim() ? searchChords(search).slice(0, 24) : [];
  const typed = search.trim();
  const showTypedChoice = typed && !searchResults.includes(typed);

  return (
    <>
      <h1>הוספת מנגינה</h1>
      <p className="subtitle">הוספה פתוחה בגרסה זו לכולם, בלי הרשמה. בגרסה מלאה היא תדרוש רישום כחזן.</p>
      {error && <div className="error">{error}</div>}

      <div className="field">
        <label>חלק בהלל</label>
        <select value={part} onChange={(e) => setPart(e.target.value)}>
          {HALLEL_PARTS.map((p) => (
            <option key={p.id} value={p.id}>
              מזמור {p.id} — {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>שם השיר <span className="req">* חובה</span></label>
        <input type="text" value={songName} onChange={(e) => setSongName(e.target.value)} placeholder="למשל: הללו עבדי ה׳ (ניגון מסורתי)" />
      </div>

      <div className="field">
        <label>🎼 סולם השיר</label>
        <select value={scale} onChange={(e) => setScale(e.target.value)}>
          {allScales().map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <p className="note" style={{ textAlign: "right" }}>
          הסולם נבחר כאן, פעם אחת, ומשפיע על כל האקורדים בשיר. בפאנל האקורדים למטה הוא מופיע רק כשורת מצב.
        </p>
      </div>

      <div className="field">
        <label>מתאימה במיוחד ל…</label>
        <div>
          {YEAR_TAGS.map((t) => (
            <button key={t} type="button" className={`chip ${tags.includes(t) ? "active" : ""}`} onClick={() => toggleTag(t)}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>אקורדים</label>
        <div style={{ marginBottom: 10 }}>
          <button type="button" className={`chip ${mode === "above_words" ? "active" : ""}`} onClick={() => setMode("above_words")}>
            גע במילה, גע באקורד (מעל המילים)
          </button>
          <button type="button" className={`chip ${mode === "plain_list" ? "active" : ""}`} onClick={() => setMode("plain_list")}>
            רשימת אקורדים פשוטה
          </button>
        </div>

        {mode === "plain_list" ? (
          <textarea
            value={plainText}
            onChange={(e) => setPlainText(e.target.value)}
            placeholder="למשל: Am, C, G, F — בלי מיקום מעל מילים"
          />
        ) : (
          <>
            <label style={{ fontSize: 13, fontWeight: "bold", color: "#a87f0a" }}>מילות המזמור — שורה בכל שורה</label>
            <textarea value={linesText} onChange={(e) => onLinesTextChange(e.target.value)} />
            <p className="note" style={{ textAlign: "right" }}>
              👆 גע במילה שבה האקורד מתחלף — פאנל האקורדים ייפתח, ובחר אקורד; הוא יקפוץ מעל המילה והפאנל ייסגר.
            </p>
            <div className="editor-words">
              {lines.map((words, li) => (
                <div key={li}>
                  {words.map((word, wi) => (
                    <span className="wcol" key={wi}>
                      <span className={`cb ${chords[li] && chords[li][wi] ? "" : "slot"}`}>
                        {chords[li] && chords[li][wi] ? chords[li][wi] : "＋"}
                      </span>
                      <span
                        className={`w ${selected && selected.li === li && selected.wi === wi ? "sel" : ""}`}
                        onClick={() => setSelected({ li, wi })}
                      >
                        {word}
                      </span>
                    </span>
                  ))}
                </div>
              ))}
            </div>

            {selected && (
            <div className="chord-panel">
              <div style={{ fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span>
                  🎼 סולם השיר: <b>{scale}</b> — נבחר למעלה, משפיע על כל האקורדים בשיר.
                  {` המילה שנבחרה: "${lines[selected.li][selected.wi]}"`}
                </span>
                <button type="button" aria-label="סגור פאנל" onClick={() => setSelected(null)} style={{ border: "none", background: "transparent", fontSize: 20, cursor: "pointer", flexShrink: 0 }}>
                  ✕
                </button>
              </div>
              <div className="panel-label">אקורדים מהסולם:</div>
              <div className="chordbar">
                {scaleChords(scale).map((c) => (
                  <button key={c} type="button" onClick={() => applyChord(c)}>
                    {c}
                  </button>
                ))}
                <button type="button" className="remove" onClick={removeChord}>
                  ✕ הסר
                </button>
              </div>
              <div className="panel-label">גם נפוצים, מחוץ לסולם:</div>
              <div className="chordbar">
                {outsideChords(scale).map((c) => (
                  <button key={c} type="button" onClick={() => applyChord(c)}>
                    {c}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 10 }}>
                <input
                  className="search"
                  style={{ margin: 0 }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="🔍 אקורד אחר… למשל Amaj7, מוקטן — רק בחיפוש, לא בפס הראשי"
                />
              </div>
              {search.trim() && (
                <div className="chordbar">
                  {showTypedChoice && (
                    <button type="button" onClick={() => applyChord(typed)}>
                      השתמש ב־{typed} ✓
                    </button>
                  )}
                  {searchResults.map((c) => (
                    <button key={c} type="button" onClick={() => applyChord(c)}>
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
            )}
          </>
        )}
      </div>

      <div className="field">
        <label>לינק ליוטיוב לביצוע <span className="opt">(אופציונלי)</span></label>
        <input type="url" value={youtube} onChange={(e) => setYoutube(e.target.value)} placeholder="https://youtube.com/watch?v=…" />
      </div>

      <div style={{ textAlign: "center" }}>
        <button className="gold-btn" onClick={publish}>
          פרסם מנגינה
        </button>
      </div>
    </>
  );
}
