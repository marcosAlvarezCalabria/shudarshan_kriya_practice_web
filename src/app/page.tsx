"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Orb } from "@/components/Orb";
import { PostureCard } from "@/components/PostureCard";
import { OFFICIAL_NEUTRAL_TEMPLATE } from "@/domain/sessionTemplates";
import { createInitialSessionState, sessionReducer } from "@/application/sessionReducer";
import { formatMs } from "@/lib/time";
import { audioEngine } from "@/lib/audioEngine";
import {
  acceptDisclaimer,
  getStats,
  hasAcceptedDisclaimer,
  saveSessionRecord,
} from "@/lib/storage";
import { DisclaimerModal } from "@/components/DisclaimerModal";

export default function HomePage() {
  const template = OFFICIAL_NEUTRAL_TEMPLATE;
  const [state, dispatch] = useReducer(sessionReducer, createInitialSessionState(template));
  const [stats, setStats] = useState({ streak: 0, totalSessions: 0 });
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const prevPhaseRef = useRef(0);

  const currentPhase = template.phases[state.phaseIndex];
  const totalDuration = useMemo(
    () => template.phases.reduce((sum, phase) => sum + phase.durationMs, 0),
    [template],
  );
  useEffect(() => {
    setStats(getStats());
  }, []);

  useEffect(() => {
    if (state.status !== "running") return;

    let raf = 0;
    const tick = () => {
      dispatch({ type: "TICK", nowMs: Date.now(), template });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [state.status, template]);

  useEffect(() => {
    if (state.status === "running" && state.phaseIndex !== prevPhaseRef.current) {
      const nextAudio = template.phases[state.phaseIndex]?.audioAsset;
      if (state.settings.bellOn) {
        window.navigator.vibrate?.(state.settings.vibrationOn ? 120 : 0);
      }
      if (nextAudio && state.settings.musicOn) {
        audioEngine.crossfadeTo(nextAudio, { fadeInMs: 1800, fadeOutMs: 1800, volume: state.settings.volume });
      }
      prevPhaseRef.current = state.phaseIndex;
    }
  }, [state.phaseIndex, state.settings, state.status, template]);

  useEffect(() => {
    if (state.status === "completed" && !hasCompleted) {
      saveSessionRecord({
        completedAtISO: new Date().toISOString(),
        templateId: state.templateId,
        totalDurationMs: state.totalElapsedMs,
      });
      setStats(getStats());
      audioEngine.stopAll();
      setHasCompleted(true);
    }
    if (state.status !== "completed") {
      setHasCompleted(false);
    }
  }, [hasCompleted, state.status, state.templateId, state.totalElapsedMs]);

  const handleStart = async () => {
    if (!hasAcceptedDisclaimer()) {
      setDisclaimerOpen(true);
      return;
    }

    dispatch({ type: "START", nowMs: Date.now() });
    const audio = currentPhase?.audioAsset;
    if (audio && state.settings.musicOn) {
      await audioEngine.playPhaseAudio(audio, { fadeInMs: 1200, volume: state.settings.volume });
    }
  };

  const handlePauseResume = () => {
    if (state.status === "running") {
      dispatch({ type: "PAUSE" });
      return;
    }

    if (state.status === "paused") {
      dispatch({ type: "RESUME", nowMs: Date.now() });
    }
  };

  const handleStop = () => {
    dispatch({ type: "STOP", template });
    audioEngine.stopAll();
    prevPhaseRef.current = 0;
  };

  const handleRestart = async () => {
    dispatch({ type: "RESTART", template, nowMs: Date.now() });
    audioEngine.stopAll();
    const audio = template.phases[0]?.audioAsset;
    if (audio && state.settings.musicOn) {
      await audioEngine.playPhaseAudio(audio, { fadeInMs: 900, volume: state.settings.volume });
    }
    prevPhaseRef.current = 0;
  };

  const showWhereAmI = () => {
    dispatch({ type: "SHOW_WHERE_AM_I" });
    setTimeout(() => dispatch({ type: "HIDE_WHERE_AM_I" }), 2000);
  };

  const nextPhase = template.phases[state.phaseIndex + 1];

  return (
    <main className="space-y-5">
      <section className="grid gap-4 rounded-2xl bg-card p-4 md:grid-cols-[1fr_280px]">
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-slate-300">{currentPhase?.label ?? "Completed"}</p>
          {currentPhase?.meta?.round ? <p className="text-xs text-slate-400">Round {currentPhase.meta.round}</p> : null}
          <Orb status={state.status} />
          <p className="text-4xl font-semibold tabular-nums">{formatMs(state.phaseRemainingMs)}</p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
            <div
              className="h-full bg-accent"
              style={{ width: `${Math.min(100, (state.totalElapsedMs / totalDuration) * 100)}%` }}
            />
          </div>
          {state.phaseRemainingMs <= 2000 && nextPhase ? (
            <p className="text-xs text-slate-400">Next: {nextPhase.label}</p>
          ) : null}
        </div>
        <div className="space-y-4">
          <PostureCard src={currentPhase?.postureAsset ?? "/postures/rest.svg"} label={currentPhase?.label ?? "Done"} />
          <div className="rounded-2xl bg-slate-900/70 p-4">
            <h3 className="mb-2 text-sm font-medium">Stats</h3>
            <p className="text-sm text-slate-300">Streak: {stats.streak} days</p>
            <p className="text-sm text-slate-300">Total sessions: {stats.totalSessions}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 rounded-2xl bg-card p-4 md:grid-cols-2">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <button aria-label="Start session" onClick={handleStart} className="rounded-xl bg-accent px-4 py-3 text-slate-950">
            Start
          </button>
          <button aria-label="Pause or resume" onClick={handlePauseResume} className="rounded-xl bg-slate-700 px-4 py-3">
            {state.status === "paused" ? "Resume" : "Pause"}
          </button>
          <button aria-label="Stop session" onClick={handleStop} className="rounded-xl bg-slate-700 px-4 py-3">
            Stop
          </button>
          <button aria-label="Restart session" onClick={handleRestart} className="rounded-xl bg-slate-700 px-4 py-3">
            Restart
          </button>
        </div>
        <div className="grid gap-2">
          <label className="flex items-center justify-between text-sm">
            <span>Music</span>
            <input
              aria-label="Music on or off"
              type="checkbox"
              checked={state.settings.musicOn}
              onChange={() => dispatch({ type: "TOGGLE_MUSIC" })}
            />
          </label>
          <label className="flex items-center justify-between text-sm">
            <span>Volume</span>
            <input
              aria-label="Volume"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={state.settings.volume}
              onChange={(event) => {
                const volume = Number(event.target.value);
                dispatch({ type: "SET_VOLUME", volume });
                audioEngine.setVolume(volume);
              }}
            />
          </label>
          <label className="flex items-center justify-between text-sm">
            <span>Transition Bell</span>
            <input
              aria-label="Transition bell"
              type="checkbox"
              checked={state.settings.bellOn}
              onChange={() => dispatch({ type: "TOGGLE_BELL" })}
            />
          </label>
          <label className="flex items-center justify-between text-sm">
            <span>Vibration</span>
            <input
              aria-label="Vibration on or off"
              type="checkbox"
              checked={state.settings.vibrationOn}
              onChange={() => dispatch({ type: "TOGGLE_VIBRATION" })}
            />
          </label>
          <button aria-label="Where am I" onClick={showWhereAmI} className="rounded-xl border border-slate-700 px-4 py-3 text-sm">
            Where am I?
          </button>
        </div>
      </section>

      {state.ui.showWhereAmIOverlay ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/65 p-6">
          <div className="rounded-2xl bg-card p-6 text-center">
            <p className="text-2xl font-semibold">{currentPhase?.label}</p>
            <p className="mt-2 text-sm text-slate-300">Posture reference on screen</p>
          </div>
        </div>
      ) : null}

      <DisclaimerModal
        isOpen={disclaimerOpen}
        onAccept={() => {
          acceptDisclaimer();
          setDisclaimerOpen(false);
          handleStart();
        }}
        onCancel={() => setDisclaimerOpen(false)}
      />
    </main>
  );
}
