"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addStored, uid } from "../lib/store";

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

  const onFlyer = (file) => {
    if (!file) {
      setFlyerPreview("");
      return;
    }
    setFlyerPreview(URL.createObjectURL(file));
  };

  const publish = () => {
    if (!date || !time || !synagogue.trim() || !address.trim()) {
      setError("יש למלא את כל שדות החובה: תאריך, שעת תפילה, שם בית כנסת וכתובת מדויקת.");
      return;
    }
    addStored("hm_performances", {
      id: uid("p-user"),
      title: `הלל מוזיקלי — ${synagogue.trim()}`,
      date,
      time,
      occasion: "",
      city: city.trim() || "—",
      synagogue: synagogue.trim(),
      address: address.trim(),
      chazzanId: null,
      chazzanName: chazzan.trim() || "—",
      likes: 0,
    });
    router.push("/");
  };

  return (
    <>
      <h1>הוספת תפילה</h1>
      <p className="subtitle">הוספה פתוחה בגרסה זו לכולם, בלי הרשמה. בגרסה מלאה היא תדרוש רישום.</p>
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
        <button className="gold-btn" onClick={publish}>
          פרסם תפילה
        </button>
      </div>
    </>
  );
}
