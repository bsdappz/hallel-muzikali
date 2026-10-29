"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { postPerformance, fetchMe } from "../lib/api";
import { todayIso } from "../lib/data";

export default function AddPerformancePage() {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [synagogue, setSynagogue] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [chazzan, setChazzan] = useState("");
  const [flyerPreview, setFlyerPreview] = useState("");
  const [error, setError] = useState("");
  const [authed, setAuthed] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    fetchMe()
      .then((d) => {
        if (d.user) setAuthed(true);
        else router.push("/login");
      })
      .catch(() => router.push("/login"));
  }, [router]);

  if (!authed) return <p>טוען...</p>;

  const onFlyer = (file) => {
    if (!file) {
      setFlyerPreview("");
      return;
    }
    setFlyerPreview(URL.createObjectURL(file));
  };

  const publish = async () => {
    if (!date || !time || !synagogue.trim() || !address.trim()) {
      setError("יש למלא את כל שדות החובה: תאריך, שעת תפילה, שם בית כנסת וכתובת מדויקת.");
      return;
    }
    if (date < todayIso()) {
      setError("התאריך שבחרת כבר עבר — דף הבית מציג רק תפילות עתידיות, אז תפילה בתאריך עבר לא תופיע. בחר תאריך עתידי.");
      return;
    }
    setError("");
    setPublishing(true);
    try {
      await postPerformance({
        date,
        time,
        synagogue: synagogue.trim(),
        address: address.trim(),
        city: city.trim(),
        chazzan: chazzan.trim(),
      });
      // Full-page navigation, not router.push: the App Router's client
      // cache can otherwise keep showing the form / a stale home list.
      // A fresh load guarantees the new item is visible immediately.
      window.location.href = "/";
    } catch (e) {
      setPublishing(false);
      setError(e.message || "השמירה נכשלה. נסה שוב.");
    }
  };

  return (
    <>
      <h1>הוספת תפילה</h1>
      <p className="subtitle">הוספת תפילה דורשת התחברות. התפילה תישמר בדיבי המשותף ותופיע בדף הבית לכולם.</p>
      {error && <div className="error">{error}</div>}

      <div className="field">
        <label>תאריך <span className="req">* חובה</span></label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="field">
        <label>שעת תפילה <span className="req">* חובה</span></label>
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      </div>
      <div className="field">
        <label>שם בית הכנסת <span className="req">* חובה</span></label>
        <input type="text" value={synagogue} onChange={(e) => setSynagogue(e.target.value)} placeholder="למשל: בית כנסת ספיר" />
      </div>
      <div className="field">
        <label>כתובת מדויקת <span className="req">* חובה</span></label>
        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="רחוב, מספר, עיר" />
      </div>
      <div className="field">
        <label>עיר <span className="opt">(מומלץ — לסינון בדף הבית)</span></label>
        <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="למשל: לוד" />
      </div>
      <div className="field">
        <label>חזן <span className="opt">(אופציונלי)</span></label>
        <input type="text" value={chazzan} onChange={(e) => setChazzan(e.target.value)} placeholder="שם החזן" />
      </div>
      <div className="field">
        <label>פלייר פרסום <span className="opt">(אופציונלי — בגרסה זו תצוגה מקדימה בלבד, לא נשמר)</span></label>
        <input type="file" accept="image/*" onChange={(e) => onFlyer(e.target.files && e.target.files[0])} />
        {flyerPreview && (
          <div style={{ marginTop: 10 }}>
            <img src={flyerPreview} alt="תצוגה מקדימה של הפלייר" style={{ maxWidth: "100%", borderRadius: 12 }} />
          </div>
        )}
      </div>

      <div style={{ textAlign: "center" }}>
        <button className="gold-btn" onClick={publish} disabled={publishing}>
          {publishing ? "מפרסם…" : "פרסם תפילה"}
        </button>
      </div>
    </>
  );
}
