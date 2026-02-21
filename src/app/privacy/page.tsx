export default function PrivacyPage() {
  return (
    <main className="rounded-2xl bg-card p-5">
      <h2 className="mb-3 text-xl font-semibold">Privacy</h2>
      <p className="text-sm text-slate-300">
        This MVP stores only local session data in your browser (session history, streak, and disclaimer
        acknowledgment).
      </p>
      <p className="mt-3 text-sm text-slate-300">No server-side account, analytics, or remote database is used.</p>
    </main>
  );
}
