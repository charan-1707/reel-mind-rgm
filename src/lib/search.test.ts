import { describe, expect, it } from "vitest";
import { REELS } from "./reels";
import { availableTags, filterReels } from "./search";

const sample = REELS.slice(0, 6);

describe("availableTags", () => {
  it("returns unique sorted tags", () => {
    const tags = availableTags(sample);
    expect(tags).toEqual([...new Set(tags)].sort());
    expect(tags.length).toBeGreaterThan(0);
  });

  it("handles an empty catalogue", () => {
    expect(availableTags([])).toEqual([]);
  });
});

describe("filterReels", () => {
  it("returns everything with no filters", () => {
    expect(filterReels({ reels: sample })).toHaveLength(sample.length);
  });

  it("matches titles case-insensitively", () => {
    const target = sample[0]!;
    const found = filterReels({ reels: sample, query: target.title.toUpperCase() });
    expect(found.map((r) => r.id)).toContain(target.id);
  });

  it("matches creators and summaries", () => {
    const target = sample[1]!;
    expect(filterReels({ reels: sample, query: target.creator }).map((r) => r.id)).toContain(
      target.id,
    );
    const word = target.summary.split(" ")[1]!;
    expect(filterReels({ reels: sample, query: word }).length).toBeGreaterThan(0);
  });

  it("filters by tag", () => {
    const tag = sample[0]!.tags[0]!;
    const found = filterReels({ reels: sample, tag });
    expect(found.length).toBeGreaterThan(0);
    expect(found.every((r) => r.tags.includes(tag))).toBe(true);
  });

  it("combines tag and query as AND", () => {
    const tag = sample[0]!.tags[0]!;
    expect(filterReels({ reels: sample, tag, query: "zzzz-no-match" })).toEqual([]);
  });

  it("ignores surrounding whitespace", () => {
    const target = sample[2]!;
    expect(filterReels({ reels: sample, query: `  ${target.title}  ` }).map((r) => r.id)).toEqual([
      target.id,
    ]);
  });

  it("preserves input order", () => {
    const found = filterReels({ reels: sample });
    expect(found.map((r) => r.id)).toEqual(sample.map((r) => r.id));
  });
});
