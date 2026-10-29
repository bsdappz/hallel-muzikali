"use client";

// Social login buttons. Rendered only for providers whose OAuth keys are
// actually configured (see /api/auth/providers) — unconfigured providers
// show nothing instead of a broken button.
import { useEffect, useState } from "react";

const LABELS = { google: "המשך עם Google", facebook: "המשך עם Facebook" };

export default function SocialButtons() {
  const [providers, setProviders] = useState(null);

  useEffect(() => {
    fetch("/api/auth/providers", { cache: "no-store" })
      .then((r) => r.json())
      .then(setProviders)
      .catch(() => setProviders({}));
  }, []);

  if (!providers) return null;
  const shown = Object.keys(LABELS).filter((p) => providers[p]);
  if (shown.length === 0) return null;

  return (
    <div style={{ textAlign: "center", marginTop: 16 }}>
      <p className="note" style={{ textAlign: "center" }}>
        או דרך הרשתות החברתיות:
      </p>
      {shown.map((p) => (
        <div key={p} style={{ marginTop: 8 }}>
          <a className="gold-btn" href={`/api/auth/${p}`} style={{ textDecoration: "none" }}>
            {LABELS[p]}
          </a>
        </div>
      ))}
    </div>
  );
}
