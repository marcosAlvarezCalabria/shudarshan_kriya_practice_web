"use client";

import { SessionStatus } from "@/application/sessionReducer";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useEffect, useMemo, useRef, useState } from "react";

export type BreathPhase = "inhale" | "hold" | "exhale";

type OrbProps = {
  status: SessionStatus;
};

type PhaseConfig = {
  phase: BreathPhase;
  durationMs: number;
};

const BREATH_CYCLE: PhaseConfig[] = [
  { phase: "inhale", durationMs: 4000 },
  { phase: "hold", durationMs: 4000 },
  { phase: "exhale", durationMs: 6000 },
];

const TOTAL_CYCLE_MS = BREATH_CYCLE.reduce((total, segment) => total + segment.durationMs, 0);

const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

const getBreathingFrame = (elapsedMs: number) => {
  const cyclePositionMs = elapsedMs % TOTAL_CYCLE_MS;
  let cursor = cyclePositionMs;

  for (const segment of BREATH_CYCLE) {
    if (cursor < segment.durationMs) {
      const progress = segment.durationMs === 0 ? 1 : cursor / segment.durationMs;
      const secondsInPhase = Math.floor(cursor / 1000) + 1;
      const phaseSeconds = Math.max(1, Math.ceil(segment.durationMs / 1000));
      const counter = Math.min(secondsInPhase, phaseSeconds);

      if (segment.phase === "inhale") {
        return {
          phase: segment.phase,
          counter,
          scale: 1 + 0.4 * easeInOutSine(progress),
        };
      }

      if (segment.phase === "hold") {
        return {
          phase: segment.phase,
          counter,
          scale: 1.4,
        };
      }

      return {
        phase: segment.phase,
        counter,
        scale: 1.4 - 0.4 * easeInOutSine(progress),
      };
    }

    cursor -= segment.durationMs;
  }

  return { phase: "inhale" as BreathPhase, counter: 1, scale: 1 };
};

const getPhaseLabel = (phase: BreathPhase) => {
  if (phase === "inhale") return "Inhale";
  if (phase === "hold") return "Hold";
  return "Exhale";
};

export const Orb = ({ status }: OrbProps) => {
  const reducedMotion = usePrefersReducedMotion();
  const rafRef = useRef<number>();
  const runStartRef = useRef<number | null>(null);
  const accumulatedElapsedRef = useRef(0);

  const initialFrame = useMemo(() => getBreathingFrame(0), []);
  const [frame, setFrame] = useState(initialFrame);

  useEffect(() => {
    if (status === "idle" || status === "completed") {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      runStartRef.current = null;
      accumulatedElapsedRef.current = 0;
      setFrame(getBreathingFrame(0));
      return;
    }

    if (status === "paused") {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (runStartRef.current !== null) {
        accumulatedElapsedRef.current += performance.now() - runStartRef.current;
      }
      runStartRef.current = null;
      return;
    }

    if (reducedMotion) {
      setFrame(getBreathingFrame(accumulatedElapsedRef.current));
      return;
    }

    runStartRef.current = performance.now();

    const animate = (now: number) => {
      const start = runStartRef.current ?? now;
      const elapsedMs = accumulatedElapsedRef.current + (now - start);
      setFrame(getBreathingFrame(elapsedMs));
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [status, reducedMotion]);

  return (
    <div className="relative flex h-64 w-64 flex-col items-center justify-center md:h-80 md:w-80">
      <div
        className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-sky-300/70 to-indigo-500/60 shadow-[0_0_65px_rgba(124,198,254,0.55)]"
        style={{ transform: `scale(${frame.scale})` }}
      >
        <span className="text-5xl font-semibold tabular-nums text-slate-950">{frame.counter}</span>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-200">{getPhaseLabel(frame.phase)}</p>
    </div>
  );
};
