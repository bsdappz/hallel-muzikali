"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MELODIES } from "../../lib/data";
import { loadStored, loadLikes, saveLikes } from "../../lib/store";

export default function MelodyPage() {
  const params = useParams();
  const [melody, setMelody] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const all = [...MELODIES, ...loadStored("hm_melodies")];
    setMelody(all.find((m) => m.id === params.id) || null);
    setLoaded(true);
    setLiked(!!loadLikes()[params.id]);
  }, [params.id]);

  const toggleLike = () => {
    const likes = loadLikes();
    if (likes[params.id]) delete likes[params.id];
    else likes[params.id] = true;
    saveLikes(likes);
    setLiked(!liked);
  };

  if (!loaded) return <p>טוען...</p>;
  if (!melody) return <p>המנגינה לא נמצאה. <Link href="/melodies">חזרה לספרייה</Link></p>;

  return (
    <>
      <Link href="/melodies">← חזרה לספריית מנגינות</Link>
      <h1 style={{ marginTop: 10 }}>{melody.title}</h1>
      <p className="subtitle">
        מזמור {melody.part}
        {melody.partName ? ` • ${melody.partName}` : ""} • חזן:{" "}
        {melody.chazzanId ? <Link href={`/chazzanim/${melody.chazzanId}`}>{melody.chazzanName}</Link> : melody.chazzanName}
        {melody.scale ? ` • סולם ${melody.scale}` : ""}
      </p>
      <div>
        {(melody.tags || []).map((t) => (
          <span className="chip" key={t}>
            {t}
          </span>
        ))}
      </div>

      {melody.chords_mode === "plain_list" ? (
        <div className="melody" style={{ marginTop: 16 }}>
          <div className="m-title">רשימת אקורדים</div>
          <div style={{ direction: "ltr", textAlign: "right", fontSize: 18, fontWeight: "bold", color: "#a87f0a", marginTop: 8 }}>
            {(melody.plain_chords || []).join("  •  ")}
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 16 }}>
          {(melody.lines || []).map((line, li) => (
            <div className="chord-line" key={li}>
              {line.words.map((word, wi) => (
                <span className="wcol" key={wi}>
                  <span className={`cb ${line.chords && line.chords[wi] ? "" : "empty"}`}>
                    {line.chords && line.chords[wi] ? line.chords[wi] : " "}
                  </span>
                  <span className="w">{word}</span>
                </span>
              ))}
            </div>
          ))}
          <p className="note">האקורד מופיע מעל המילה שבה הוא מתחלף.</p>
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: 20 }}>
        {melody.youtube_url && (
          <a className="gold-btn" href={melody.youtube_url} target="_blank" rel="noreferrer">
            ▶ צפה בביצוע ביוטיוב
          </a>
        )}
        <button className={`like-btn ${liked ? "liked" : ""}`} onClick={toggleLike}>
          👍 {melody.likes + (liked ? 1 : 0)}
        </button>
      </div>
    </>
  );
}
