"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "../lib/api";
import SocialButtons from "../components/SocialButtons";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    try {
      await registerUser({ name: name.trim(), email: email.trim(), password });
      // Full reload so the header re-reads the new session immediately.
      window.location.href = "/";
    } catch (e) {
      setError(e.message || "ההרשמה נכשלה.");
    }
  };

  return (
    <>
      <h1>הרשמה</h1>
      <p className="subtitle">נרשמים כחזן כדי להוסיף תפילות ומנגינות ולסמן אהבתי. ההרשמה נשמרת בדיבי של האתר.</p>
      {error && <div className="error">{error}</div>}
      <div className="field">
        <label>שם <span className="req">* חובה</span></label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="השם שלך" />
      </div>
      <div className="field">
        <label>מייל <span className="req">* חובה</span></label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </div>
      <div className="field">
        <label>סיסמה <span className="req">* לפחות 6 תווים</span></label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div style={{ textAlign: "center" }}>
        <button className="gold-btn" onClick={submit}>
          הירשם
        </button>
      </div>
      <SocialButtons />
      <p className="note" style={{ textAlign: "center" }}>
        כבר רשום? <Link href="/login">התחבר כאן</Link>
      </p>
    </>
  );
}
