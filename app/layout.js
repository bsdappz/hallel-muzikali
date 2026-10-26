import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "הלל מוזיקלי",
  description: "תפילות הלל מוזיקלי קרובות וספריית מנגינות להלל",
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body>
        <header className="app-header">
          <Link href="/" className="logo">
            הלל <span>מוזיקלי</span> 🎶
          </Link>
          <nav className="nav">
            <Link href="/">🎤 תפילות קרובות</Link>
            <Link href="/melodies">🎵 ספריית מנגינות</Link>
            <Link href="/add-melody">＋ הוסף מנגינה</Link>
            <Link href="/add-performance">＋ הוסף תפילה</Link>
          </nav>
        </header>
        <main className="container">{children}</main>
        <footer className="footer">
          הלל מוזיקלי — גרסה ראשונה. הצפייה פתוחה לכולם, בלי הרשמה.
          <br />
          הוספות נשמרות בדיבי המשותף של האתר וגלויות לכולם.
        </footer>
      </body>
    </html>
  );
}
