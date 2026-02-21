"use client";

import { OrbSegment } from "@/domain/sessionTemplate";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useEffect, useMemo, useRef, useState } from "react";

type OrbProps = {
  pattern: OrbSegment[];
  phaseProgress: number;
  isRunning: boolean;
};

const getScaleFromPattern = (pattern: OrbSegment[], elapsedMs: number) => {
  const total = pattern.reduce((sum, seg) => sum + seg.ms, 0);
  if (total <= 0) return 1;
  let cursor = elapsedMs % total;

  for (const seg of pattern) {
    if (cursor <= seg.ms) {
      const t = seg.ms === 0 ? 1 : cursor / seg.ms;
      if (seg.kind === "expand") return 1 + 0.25 * t;
      if (seg.kind === "hold") return 1.25;
      if (seg.kind === "contract") return 1.25 - 0.25 * t;
      return 1;
    }
    cursor -= seg.ms;
  }

  return 1;
};

export const Orb = ({ pattern, phaseProgress, isRunning }: OrbProps) => {
  const reducedMotion = usePrefersReducedMotion();
  const rafRef = useRef<number>();
  const [scale, setScale] = useState(1);
  const patternSafe = useMemo(() => (pattern.length ? pattern : [{ kind: "idle", ms: 2000 }]), [pattern]);

  useEffect(() => {
    if (reducedMotion || !isRunning) {
      setScale(1);
      return;
    }

    const startAt = performance.now() - phaseProgress * patternSafe.reduce((sum, s) => sum + s.ms, 0);

    const animate = (now: number) => {
      setScale(getScaleFromPattern(patternSafe, now - startAt));
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isRunning, patternSafe, phaseProgress, reducedMotion]);

  return (
    <div className="relative flex h-64 w-64 items-center justify-center md:h-80 md:w-80">
      <div
        className="h-full w-full rounded-full bg-gradient-to-br from-sky-300/70 to-indigo-500/60 shadow-[0_0_65px_rgba(124,198,254,0.55)] transition-transform duration-150"
        style={{ transform: `scale(${scale})` }}
        aria-hidden
      />
    </div>
  );
};
