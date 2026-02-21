export type OrbKind = "expand" | "hold" | "contract" | "idle";

export type OrbSegment = {
  kind: OrbKind;
  ms: number;
};

export type Phase = {
  id: string;
  label: string;
  durationMs: number;
  postureAsset: string;
  audioAsset?: string;
  orbPattern?: OrbSegment[];
  meta?: { round?: number; group?: string };
};

export type SessionTemplate = {
  id: string;
  name: string;
  phases: Phase[];
};
