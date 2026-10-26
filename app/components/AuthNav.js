"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchMe, logoutUser } from "../lib/api";

export default function AuthNav() {
  const [user, setUser] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchMe()
      .then((d) => setUser(d.user))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const onLogout = async () => {
    await logoutUser().catch(() => {});
    window.location.href = "/";
  };

  if (!loaded) return null;
  if (!user) {
    return (
      <span className="auth-nav">
        <Link href="/login">התחברות</Link>
        {" · "}
        <Link href="/register">הרשמה</Link>
      </span>
    );
  }
  return (
    <span className="auth-nav">
      שלום, {user.name} <button type="button" onClick={onLogout}>התנתק</button>
    </span>
  );
}
