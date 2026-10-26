"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CHAZZANIM, MELODIES, PERFORMANCES, formatDate, mapsUrl, todayIso } from "../../lib/data";
import { loadStored } from "../../lib/store";

export default function ChazzanPage() {
  const params = useParams();
  const [chazzan, setChazzan] = useState(null);
  const [melodies, setMelodies] = useState([]);
  const [performances, setPerformances] = useState([]);

  useEffect(() => {
    const found = CHAZZANIM.find((c) => c.id === params.id);
    setChazzan(found || null);
    if (!found) return;
    const allMelodies = [...MELODIES, ...loadStored("hm_melodies")];
    setMelodies(allMelodies.filter((m) => m.chazzanId === params.id));
    const allPerfs = [...PERFORMANCES, ...loadStored("hm_performances")];
    const today = todayIso();
    setPerformances(
      allPerfs
        .filter((p) => p.chazzanId === params.id && p.date >= today)
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    );
  }, [params.id]);

  if (!chazzan) return <p>החזן לא נמצא. <Link href="/melodies">חזרה לספרייה</Link></p>;

  return (
    <>
      <Link href="/melodies">← חזרה לספריית מנגינות</Link>
      <div style={{ marginTop: 14 }}>
        <span className="avatar">🎤</span>
        <span style={{ fontSize: 22, fontWeight: "bold" }}>{chazzan.name}</span>
        <div style={{ fontSize: 13, opacity: 0.75 }}>{chazzan.bio}</div>
      </div>

      <h2>המנגינות שלו</h2>
      {melodies.length === 0 && <p>אין מנגינות עדיין.</p>}
      {melodies.map((m) => (
        <div className="melody" key={m.id}>
          <div className="m-title">
            <Link href={`/melodies/${m.id}`}>{m.title}</Link>
          </div>
          <div className="m-meta">מזמור {m.part} • 👍 {m.likes}</div>
        </div>
      ))}

      <h2>תפילות קרובות שהוא מוביל</h2>
      {performances.length === 0 && <p>אין תפילות קרובות כרגע.</p>}
      {performances.map((p) => (
        <div className="melody" key={p.id}>
          <div className="m-title">{p.title}</div>
          <div className="m-meta">
            {formatDate(p.date)} • {p.time} • 📍 {p.synagogue}, {p.city}
          </div>
          <div style={{ marginTop: 6 }}>
            <a className="nav-btn" href={mapsUrl(p)} target="_blank" rel="noreferrer">
              🧭 נווט לבית הכנסת
            </a>
          </div>
        </div>
      ))}
    </>
  );
}
