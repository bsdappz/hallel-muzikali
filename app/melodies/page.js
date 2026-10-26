"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MELODIES, HALLEL_PARTS, YEAR_TAGS } from "../lib/data";
import { fetchSiteData } from "../lib/api";

export default function MelodiesPage() {
  const [melodies, setMelodies] = useState(MELODIES);
  const [part, setPart] = useState("הכל");
  const [tag, setTag] = useState("");

  useEffect(() => {
    fetchSiteData()
      .then((data) => setMelodies(data.melodies))
      .catch(() => {});
  }, []);

  // Best melodies float to the top: sorted by likes, descending.
  const visible = useMemo(() => {
    return melodies
      .filter((m) => (part === "הכל" || m.part === part))
      .filter((m) => (!tag || (m.tags || []).includes(tag)))
      .sort((a, b) => (b.likes || 0) - (a.likes || 0));
  }, [melodies, part, tag]);

  const parts = ["הכל", ...HALLEL_PARTS.map((p) => p.id)];

  return (
    <>
      <h1>ספריית מנגינות</h1>
      <p className="subtitle">
        מנגינות להלל — תמיד רלוונטיות. סננו לפי מזמור ספציפי, או לפי תגי זמנים בשנה בלבד. המנגינות הטובות צפות למעלה.
      </p>
      <div className="filters">
        <label>
          מזמור:{" "}
          <select value={part} onChange={(e) => setPart(e.target.value)}>
            {parts.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="filters">
        {YEAR_TAGS.map((t) => (
          <button key={t} className={`chip ${tag === t ? "active" : ""}`} onClick={() => setTag(tag === t ? "" : t)}>
            {t}
          </button>
        ))}
        {tag && (
          <button className="chip" onClick={() => setTag("")}>
            ✕ נקה תג
          </button>
        )}
      </div>

      {visible.length === 0 && <p>לא נמצאו מנגינות לפי הסינון הנוכחי.</p>}

      {visible.map((m) => (
        <div className="melody" key={m.id}>
          <div className="m-title">
            <Link href={`/melodies/${m.id}`}>{m.title}</Link>
          </div>
          <div className="m-meta">
            מזמור {m.part} • חזן:{" "}
            {m.chazzanId ? <Link href={`/chazzanim/${m.chazzanId}`}>{m.chazzanName}</Link> : m.chazzanName} • 👍{" "}
            {m.likes}
            {m.scale ? ` • סולם ${m.scale}` : ""}
          </div>
          <div className="m-tags">
            {(m.tags || []).map((t) => (
              <span className="chip" key={t}>
                {t}
              </span>
            ))}
          </div>
        </div>
      ))}

      <div style={{ textAlign: "center", marginTop: 16 }}>
        <Link className="gold-btn" href="/add-melody">
          ＋ הוסף מנגינה
        </Link>
      </div>
    </>
  );
}
