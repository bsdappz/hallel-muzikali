"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MELODIES, HALLEL_PARTS, YEAR_TAGS } from "../lib/data";
import { loadStored, loadLikes } from "../lib/store";

export default function MelodiesPage() {
  const [stored, setStored] = useState([]);
  const [likes, setLikes] = useState({});
  const [part, setPart] = useState("הכל");
  const [tag, setTag] = useState("");

  useEffect(() => {
    setStored(loadStored("hm_melodies"));
    setLikes(loadLikes());
  }, []);

  // Best melodies float to the top: sorted by likes, descending.
  const visible = useMemo(() => {
    const all = [...MELODIES, ...stored];
    return all
      .filter((m) => (part === "הכל" || m.part === part))
      .filter((m) => (!tag || (m.tags || []).includes(tag)))
      .sort((a, b) => (b.likes + (likes[b.id] ? 1 : 0)) - (a.likes + (likes[a.id] ? 1 : 0)));
  }, [stored, likes, part, tag]);

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
            {m.likes + (likes[m.id] ? 1 : 0)}
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
