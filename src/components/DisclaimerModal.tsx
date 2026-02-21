"use client";

type Props = {
  isOpen: boolean;
  onAccept: () => void;
  onCancel: () => void;
};

export const DisclaimerModal = ({ isOpen, onAccept, onCancel }: Props) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-card p-6 text-slate-100 shadow-2xl">
        <h2 className="mb-3 text-xl font-semibold">Before you begin</h2>
        <p className="text-sm leading-relaxed text-slate-300">
          This app is a timing and posture-reference tool for practitioners who have already learned the
          practice from a qualified instructor. It does not teach breathing techniques. Not affiliated
          with or endorsed by The Art of Living Foundation.
        </p>
        <div className="mt-6 flex gap-3">
          <button onClick={onAccept} className="rounded-xl bg-accent px-4 py-3 font-semibold text-slate-950">
            I Understand
          </button>
          <button onClick={onCancel} className="rounded-xl border border-slate-600 px-4 py-3">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
