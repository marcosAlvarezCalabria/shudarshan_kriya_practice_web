import Image from "next/image";

type Props = { src: string; label: string };

export const PostureCard = ({ src, label }: Props) => (
  <div className="w-full rounded-2xl bg-card p-4 shadow-lg">
    <h3 className="mb-2 text-sm font-medium text-slate-300">Posture reference</h3>
    <div className="flex items-center gap-3">
      <Image src={src} alt={label} width={96} height={96} className="rounded-xl bg-slate-800 p-2" />
      <p className="text-sm text-slate-200">{label}</p>
    </div>
  </div>
);
