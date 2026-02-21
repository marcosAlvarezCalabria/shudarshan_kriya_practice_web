import { SessionTemplate } from "@/domain/sessionTemplate";

export type SessionStatus = "idle" | "running" | "paused" | "completed";

export type SessionState = {
  templateId: string;
  phaseIndex: number;
  phaseRemainingMs: number;
  totalElapsedMs: number;
  status: SessionStatus;
  settings: {
    musicOn: boolean;
    volume: number;
    bellOn: boolean;
    vibrationOn: boolean;
  };
  ui: {
    showWhereAmIOverlay: boolean;
  };
  lastTickMs?: number;
};

export type SessionAction =
  | { type: "LOAD_TEMPLATE"; template: SessionTemplate }
  | { type: "START"; nowMs: number }
  | { type: "TICK"; nowMs: number; template: SessionTemplate }
  | { type: "PAUSE" }
  | { type: "RESUME"; nowMs: number }
  | { type: "STOP"; template: SessionTemplate }
  | { type: "RESTART"; template: SessionTemplate; nowMs: number }
  | { type: "NEXT_PHASE"; template: SessionTemplate; carryMs?: number }
  | { type: "COMPLETE" }
  | { type: "TOGGLE_MUSIC" }
  | { type: "SET_VOLUME"; volume: number }
  | { type: "TOGGLE_BELL" }
  | { type: "TOGGLE_VIBRATION" }
  | { type: "SHOW_WHERE_AM_I" }
  | { type: "HIDE_WHERE_AM_I" };

export const createInitialSessionState = (template: SessionTemplate): SessionState => ({
  templateId: template.id,
  phaseIndex: 0,
  phaseRemainingMs: template.phases[0]?.durationMs ?? 0,
  totalElapsedMs: 0,
  status: "idle",
  settings: {
    musicOn: true,
    volume: 0.65,
    bellOn: true,
    vibrationOn: false,
  },
  ui: {
    showWhereAmIOverlay: false,
  },
});

export const sessionReducer = (state: SessionState, action: SessionAction): SessionState => {
  switch (action.type) {
    case "LOAD_TEMPLATE":
      return createInitialSessionState(action.template);
    case "START":
      if (state.status === "running") return state;
      return { ...state, status: "running", lastTickMs: action.nowMs };
    case "PAUSE":
      if (state.status !== "running") return state;
      return { ...state, status: "paused", lastTickMs: undefined };
    case "RESUME":
      if (state.status !== "paused") return state;
      return { ...state, status: "running", lastTickMs: action.nowMs };
    case "STOP":
      return createInitialSessionState(action.template);
    case "RESTART":
      return {
        ...createInitialSessionState(action.template),
        status: "running",
        lastTickMs: action.nowMs,
      };
    case "NEXT_PHASE": {
      const nextIndex = state.phaseIndex + 1;
      if (nextIndex >= action.template.phases.length) {
        return { ...state, phaseRemainingMs: 0, status: "completed", lastTickMs: undefined };
      }
      return {
        ...state,
        phaseIndex: nextIndex,
        phaseRemainingMs: Math.max(
          0,
          action.template.phases[nextIndex].durationMs - (action.carryMs ?? 0),
        ),
      };
    }
    case "TICK": {
      if (state.status !== "running") return state;
      const prevTick = state.lastTickMs ?? action.nowMs;
      const delta = Math.max(0, action.nowMs - prevTick);
      let remaining = state.phaseRemainingMs - delta;
      let phaseIndex = state.phaseIndex;

      while (remaining <= 0 && phaseIndex < action.template.phases.length - 1) {
        const carry = Math.abs(remaining);
        phaseIndex += 1;
        remaining = action.template.phases[phaseIndex].durationMs - carry;
      }

      const atEnd = remaining <= 0 && phaseIndex >= action.template.phases.length - 1;

      return {
        ...state,
        phaseIndex,
        phaseRemainingMs: atEnd ? 0 : remaining,
        totalElapsedMs: state.totalElapsedMs + delta,
        status: atEnd ? "completed" : state.status,
        lastTickMs: atEnd ? undefined : action.nowMs,
      };
    }
    case "COMPLETE":
      return { ...state, status: "completed", phaseRemainingMs: 0, lastTickMs: undefined };
    case "TOGGLE_MUSIC":
      return { ...state, settings: { ...state.settings, musicOn: !state.settings.musicOn } };
    case "SET_VOLUME":
      return { ...state, settings: { ...state.settings, volume: action.volume } };
    case "TOGGLE_BELL":
      return { ...state, settings: { ...state.settings, bellOn: !state.settings.bellOn } };
    case "TOGGLE_VIBRATION":
      return { ...state, settings: { ...state.settings, vibrationOn: !state.settings.vibrationOn } };
    case "SHOW_WHERE_AM_I":
      return { ...state, ui: { ...state.ui, showWhereAmIOverlay: true } };
    case "HIDE_WHERE_AM_I":
      return { ...state, ui: { ...state.ui, showWhereAmIOverlay: false } };
    default:
      return state;
  }
};
