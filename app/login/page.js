"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser } from "../lib/api";
import SocialButtons from "../components/SocialButtons";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    try {
      await loginUser({ email: email.trim(), password });
      // Full reload so the header re-reads the new session immediately.
      window.location.href = "/";
    } catch (e) {
      setError(e.message || "ההתחברות נכשלה.");
    }
  };

  return (
    <>
      <h1>התחברות</h1>
      <p className="subtitle">התחברות דרושה להוספת תפילות ומנגינות ולסימון אהבתי. הצפייה פתוחה לכולם.</p>
      {error && <div className="error">{error}</div>}
      <div className="field">
        <label>מייל</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </div>
      <div className="field">
        <label>סיסמה</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
        />
      </div>
      <div style={{ textAlign: "center" }}>
        <button className="gold-btn" onClick={submit}>
          התחבר
        </button>
      </div>
      <SocialButtons />
      <p className="note" style={{ textAlign: "center" }}>
        אין לך חשבון? <Link href="/register">הירשם כאן</Link>
      </p>
    </>
  );
}
