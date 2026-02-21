import { SessionTemplate } from "./sessionTemplate";

const BASE_PATTERN = [
  { kind: "expand", ms: 2600 },
  { kind: "hold", ms: 900 },
  { kind: "contract", ms: 2600 },
  { kind: "idle", ms: 500 },
] as const;

export const OFFICIAL_NEUTRAL_TEMPLATE: SessionTemplate = {
  id: "official-neutral",
  name: "Neutral Session",
  phases: [
    {
      id: "phase-1",
      label: "Phase 1",
      durationMs: 3 * 60 * 1000,
      postureAsset: "/postures/phase1.svg",
      audioAsset: "/audio/phase1.mp3",
      orbPattern: [...BASE_PATTERN],
      meta: { round: 1, group: "core" },
    },
    {
      id: "phase-2",
      label: "Phase 2",
      durationMs: 4 * 60 * 1000,
      postureAsset: "/postures/phase2.svg",
      audioAsset: "/audio/phase2.mp3",
      orbPattern: [...BASE_PATTERN],
      meta: { round: 2, group: "core" },
    },
    {
      id: "phase-3",
      label: "Phase 3",
      durationMs: 5 * 60 * 1000,
      postureAsset: "/postures/phase3.svg",
      audioAsset: "/audio/phase3.mp3",
      orbPattern: [...BASE_PATTERN],
      meta: { round: 3, group: "core" },
    },
    {
      id: "rest",
      label: "Phase 4",
      durationMs: 5 * 60 * 1000,
      postureAsset: "/postures/rest.svg",
      audioAsset: "/audio/rest.mp3",
      orbPattern: [{ kind: "idle", ms: 2000 }],
      meta: { group: "cooldown" },
    },
  ],
};

export const CUSTOM_TEMPLATE_DEFAULT: SessionTemplate = {
  id: "custom-default",
  name: "Custom Baseline",
  phases: [
    {
      id: "custom-1",
      label: "Phase 1",
      durationMs: 2 * 60 * 1000,
      postureAsset: "/postures/active.svg",
      audioAsset: "/audio/phase1.mp3",
      orbPattern: [...BASE_PATTERN],
    },
    {
      id: "custom-2",
      label: "Phase 2",
      durationMs: 2 * 60 * 1000,
      postureAsset: "/postures/rest.svg",
      audioAsset: "/audio/rest.mp3",
      orbPattern: [{ kind: "idle", ms: 2200 }],
    },
  ],
};
