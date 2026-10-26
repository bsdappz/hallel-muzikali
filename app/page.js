"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PERFORMANCES, formatDate, mapsUrl, todayIso } from "./lib/data";
import { loadLikes, saveLikes } from "./lib/store";
import { fetchSiteData, postLike } from "./lib/api";

function FlyerPlaceholder({ title }) {
  return (
    <div className="flyer" role="img" aria-label={`פלייר עבור ${title} — מקום לפלייר שיועלה`}>
      <div className="note-icon">🎶</div>
      <div className="flyer-text">כאן יופיע הפלייר שיועלה</div>
    </div>
  );
}

export default function Home() {
  const [performances, setPerformances] = useState(PERFORMANCES);
  const [likes, setLikes] = useState({});
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("הכל");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("הכל");

  useEffect(() => {
    setLikes(loadLikes());
    fetchSiteData()
      .then((data) => setPerformances(data.performances))
      .catch(() => {});
  }, []);

  const toggleLike = (id) => {
    const liked = !likes[id];
    const delta = liked ? 1 : -1;
    setLikes((prev) => {
      const next = { ...prev };
      if (liked) next[id] = true;
      else delete next[id];
      saveLikes(next);
      return next;
    });
    setPerformances((prev) => prev.map((p) => (p.id === id ? { ...p, likes: Math.max(0, (p.likes || 0) + delta) } : p)));
    postLike(id, delta).catch(() => {
      // Revert the optimistic update if the server write failed.
      setPerformances((prev) => prev.map((p) => (p.id === id ? { ...p, likes: Math.max(0, (p.likes || 0) - delta) } : p)));
    });
  };

  const all = useMemo(() => {
    // Home shows ONLY upcoming performances — never past ones.
    const today = todayIso();
    return performances
      .filter((p) => p.date && p.date >= today)
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  }, [performances]);

  const cities = useMemo(() => ["הכל", ...new Set(all.map((p) => p.city).filter(Boolean))], [all]);
  const times = useMemo(() => ["הכל", ...new Set(all.map((p) => p.time).filter(Boolean))], [all]);

  const hasFilters = search !== "" || city !== "הכל" || date !== "" || time !== "הכל";

  const resetFilters = () => {
    setSearch("");
    setCity("הכל");
    setDate("");
    setTime("הכל");
  };

  const visible = all.filter((p) => {
    if (city !== "הכל" && p.city !== city) return false;
    if (date && p.date !== date) return false;
    if (time !== "הכל" && p.time !== time) return false;
    if (search) {
      const hay = `${p.title} ${p.synagogue} ${p.city} ${p.chazzanName || ""}`.toLowerCase();
      if (!hay.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <>
      <h1>תפילות קרובות</h1>
      <p className="subtitle">
        תפילות הלל מוזיקלי שעומדות להיות — בזמן אמת. מוצגות רק תפילות עתידיות, לעולם לא תפילות שכבר היו.
      </p>
      <input
        className="search"
        placeholder="🔍 חפש תפילה, בית כנסת, עיר או חזן..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="filters">
        <label>
          📍 עיר:{" "}
          <select value={city} onChange={(e) => setCity(e.target.value)}>
            {cities.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          📅 תאריך: <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label>
          🕐 שעה:{" "}
          <select value={time} onChange={(e) => setTime(e.target.value)}>
            {times.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        {hasFilters && (
          <button type="button" className="chip" onClick={resetFilters} style={{ marginInlineStart: 8 }}>
            ✕ נקה סינונים
          </button>
        )}
      </div>

      {visible.length === 0 && (
        <div style={{ textAlign: "center" }}>
          <p>לא נמצאו תפילות קרובות לפי הסינון הנוכחי.</p>
          {hasFilters && (
            <button type="button" className="gold-btn" onClick={resetFilters}>
              ✕ נקה סינונים והצג הכל
            </button>
          )}
        </div>
      )}

      {visible.map((p) => {
        const liked = !!likes[p.id];
        return (
          <article className="card" key={p.id}>
            <FlyerPlaceholder title={p.title} />
            <div className="body">
              <div className="date">
                {formatDate(p.date)} • {p.time}
                {p.occasion ? ` • ${p.occasion}` : ""}
              </div>
              <div className="title">{p.title}</div>
              <div className="meta">
                📍 {p.synagogue}, {p.city}
                <br />
                🎤 {p.chazzanId ? (
                  <Link href={`/chazzanim/${p.chazzanId}`}>{p.chazzanName}</Link>
                ) : (
                  p.chazzanName
                )}
              </div>
              <div>
                <a className="nav-btn" href={mapsUrl(p)} target="_blank" rel="noreferrer">
                  🧭 נווט לבית הכנסת
                </a>
                <button
                  className={`like-btn ${liked ? "liked" : ""}`}
                  onClick={() => toggleLike(p.id)}
                  aria-label={liked ? "הסר לייק" : "אהבתי"}
                >
                  👍 {p.likes}
                </button>
              </div>
            </div>
          </article>
        );
      })}

      <div style={{ textAlign: "center", marginTop: 16 }}>
        <Link className="gold-btn" href="/add-performance">
          ＋ הוסף תפילה (לרשומים — בגרסה זו פתוח לכולם)
        </Link>
      </div>
      <p className="note">בגרסה הבאה: סינון לפי מרחק נסיעה מנקודה מסוימת.</p>
    </>
  );
}
