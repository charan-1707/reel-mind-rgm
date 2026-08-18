import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  EMPTY_GUEST_STATE,
  GUEST_KEY,
  parseGuestState,
  readGuestState,
  writeGuestState,
} from "./guest-storage";
import type { Interaction } from "./scoring";

const valid: Interaction = { id: "i1", reelId: "r1", action: "liked", at: 1000 };

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k: string) => map.get(k) ?? null,
    key: (i: number) => [...map.keys()][i] ?? null,
    removeItem: (k: string) => map.delete(k),
    setItem: (k: string, v: string) => void map.set(k, v),
  } as Storage;
}

describe("parseGuestState", () => {
  it("returns an empty state for junk input", () => {
    expect(parseGuestState(null)).toEqual(EMPTY_GUEST_STATE);
    expect(parseGuestState("nope")).toEqual(EMPTY_GUEST_STATE);
    expect(parseGuestState(42)).toEqual(EMPTY_GUEST_STATE);
  });

  it("keeps valid interactions and queue ids", () => {
    expect(parseGuestState({ interactions: [valid], queue: ["r1", "r2"] })).toEqual({
      interactions: [valid],
      queue: ["r1", "r2"],
    });
  });

  it("drops malformed interactions and non-string queue ids", () => {
    const parsed = parseGuestState({
      interactions: [valid, { id: 1 }, { ...valid, action: "hacked" }, null],
      queue: ["r1", 5, undefined],
    });
    expect(parsed.interactions).toEqual([valid]);
    expect(parsed.queue).toEqual(["r1"]);
  });
});

describe("readGuestState / writeGuestState", () => {
  let store: Storage;
  beforeEach(() => {
    store = memoryStorage();
  });

  it("round-trips a profile", () => {
    writeGuestState({ interactions: [valid], queue: ["r3"] }, store);
    expect(readGuestState(store)).toEqual({ interactions: [valid], queue: ["r3"] });
  });

  it("returns the empty state when nothing is stored", () => {
    expect(readGuestState(store)).toEqual(EMPTY_GUEST_STATE);
  });

  it("recovers from corrupt JSON", () => {
    store.setItem(GUEST_KEY, "{not json");
    expect(readGuestState(store)).toEqual(EMPTY_GUEST_STATE);
  });

  it("never throws when storage is blocked", () => {
    const blocked = {
      ...store,
      setItem: vi.fn(() => {
        throw new Error("quota");
      }),
    } as unknown as Storage;
    expect(() => writeGuestState({ interactions: [], queue: [] }, blocked)).not.toThrow();
  });
});
