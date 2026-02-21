import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Breath Session Timer",
  description: "Timing and posture-reference tool for established practitioners.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto min-h-screen max-w-5xl px-4 py-5">
          <header className="mb-6 flex items-center justify-between">
            <h1 className="text-lg font-semibold">Breath Session Timer</h1>
            <nav className="flex gap-4 text-sm text-slate-300">
              <Link href="/">Session</Link>
              <Link href="/about">About</Link>
              <Link href="/privacy">Privacy</Link>
            </nav>
          </header>
          {children}
          <footer className="mt-8 rounded-xl border border-slate-800 bg-card/60 p-4 text-xs text-slate-300">
            This app is a timing and posture-reference aid for practitioners already trained by a
            qualified instructor. It does not teach breathing techniques and is not affiliated with or
            endorsed by The Art of Living Foundation. Learn from a certified instructor.
          </footer>
        </div>
      </body>
    </html>
  );
}
