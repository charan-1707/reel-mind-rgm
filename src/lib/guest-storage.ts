import type { Action, Interaction } from "./scoring";

export const GUEST_KEY = "reelmind.guest.v2";

export type GuestState = { interactions: Interaction[]; queue: string[] };

export const EMPTY_GUEST_STATE: GuestState = { interactions: [], queue: [] };

const ACTIONS: Action[] = ["watched", "liked", "skipped", "rec_up", "rec_down"];

function isInteraction(value: unknown): value is Interaction {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v["id"] === "string" &&
    typeof v["reelId"] === "string" &&
    typeof v["at"] === "number" &&
    ACTIONS.includes(v["action"] as Action)
  );
}

/** Normalise unknown parsed JSON into a valid guest state, dropping bad rows. */
export function parseGuestState(raw: unknown): GuestState {
  if (typeof raw !== "object" || raw === null) return EMPTY_GUEST_STATE;
  const v = raw as Partial<GuestState>;
  return {
    interactions: Array.isArray(v.interactions) ? v.interactions.filter(isInteraction) : [],
    queue: Array.isArray(v.queue) ? v.queue.filter((id): id is string => typeof id === "string") : [],
  };
}

/** Read the signed-out profile from local storage. Safe on the server. */
export function readGuestState(storage?: Storage): GuestState {
  const store = storage ?? (typeof window === "undefined" ? undefined : window.localStorage);
  if (!store) return EMPTY_GUEST_STATE;
  try {
    const raw = store.getItem(GUEST_KEY);
    return raw ? parseGuestState(JSON.parse(raw)) : EMPTY_GUEST_STATE;
  } catch {
    return EMPTY_GUEST_STATE;
  }
}

/** Persist the signed-out profile. Silently no-ops when storage is unavailable. */
export function writeGuestState(state: GuestState, storage?: Storage): void {
  const store = storage ?? (typeof window === "undefined" ? undefined : window.localStorage);
  if (!store) return;
  try {
    store.setItem(GUEST_KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked — stay in memory */
  }
}
