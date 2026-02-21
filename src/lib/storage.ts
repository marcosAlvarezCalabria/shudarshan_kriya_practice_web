export type SessionRecord = {
  completedAtISO: string;
  templateId: string;
  totalDurationMs: number;
};

const HISTORY_KEY = "breath_timer_history_v1";
const DISCLAIMER_KEY = "breath_timer_disclaimer_v1";

export const getHistory = (): SessionRecord[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as SessionRecord[]) : [];
  } catch {
    return [];
  }
};

export const saveSessionRecord = (record: SessionRecord) => {
  if (typeof window === "undefined") return;
  const current = getHistory();
  const next = [record, ...current].slice(0, 10);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
};

export const getStats = () => {
  const history = getHistory();
  const daySet = new Set(
    history.map((item) => new Date(item.completedAtISO).toISOString().slice(0, 10)),
  );

  const sortedDays = [...daySet].sort((a, b) => (a > b ? -1 : 1));
  let streak = 0;

  if (sortedDays.length > 0) {
    let cursor = new Date(sortedDays[0]);
    for (const day of sortedDays) {
      const cur = cursor.toISOString().slice(0, 10);
      if (day !== cur) break;
      streak += 1;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
  }

  return {
    streak,
    totalSessions: history.length,
  };
};

export const hasAcceptedDisclaimer = (): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(DISCLAIMER_KEY) === "true";
};

export const acceptDisclaimer = () => {
  if (typeof window === "undefined") return;
  localStorage.setItem(DISCLAIMER_KEY, "true");
};
