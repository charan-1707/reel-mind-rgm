import { describe, expect, it } from "vitest";
import { REELS, TAG_LABEL } from "./reels";

describe("REELS catalogue", () => {
  it("has a healthy number of reels", () => {
    expect(REELS.length).toBeGreaterThanOrEqual(10);
  });

  it("uses unique ids", () => {
    expect(new Set(REELS.map((r) => r.id)).size).toBe(REELS.length);
  });

  it("gives every reel copy, a creator and at least one tag", () => {
    for (const reel of REELS) {
      expect(reel.title.trim().length).toBeGreaterThan(0);
      expect(reel.summary.trim().length).toBeGreaterThan(0);
      expect(reel.creator.trim().length).toBeGreaterThan(0);
      expect(reel.handle.startsWith("@")).toBe(true);
      expect(reel.tags.length).toBeGreaterThan(0);
    }
  });

  it("keeps durations short and hues in range", () => {
    for (const reel of REELS) {
      expect(reel.duration).toBeGreaterThan(0);
      expect(reel.duration).toBeLessThanOrEqual(60);
      expect(reel.hue).toBeGreaterThanOrEqual(0);
      expect(reel.hue).toBeLessThan(360);
    }
  });

  it("has a human label for every tag in use", () => {
    for (const tag of new Set(REELS.flatMap((r) => r.tags))) {
      expect(TAG_LABEL[tag], `missing label for ${tag}`).toBeTruthy();
    }
  });
});
