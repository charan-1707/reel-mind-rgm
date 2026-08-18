import type { Reel } from "./reels";

/** Every tag present in the given reels, alphabetically sorted and de-duplicated. */
export function availableTags(reels: Reel[]): string[] {
  return [...new Set(reels.flatMap((r) => r.tags))].sort();
}

export type ReelFilter = {
  reels: Reel[];
  /** Free-text query matched against title, summary and creator (case-insensitive). */
  query?: string;
  /** Single tag filter; `null` or omitted means "all topics". */
  tag?: string | null;
};

/** Pure catalogue filter used by the Explore page. Order is preserved. */
export function filterReels({ reels, query = "", tag = null }: ReelFilter): Reel[] {
  const q = query.trim().toLowerCase();
  return reels.filter((reel) => {
    if (tag && !reel.tags.includes(tag)) return false;
    if (!q) return true;
    return (
      reel.title.toLowerCase().includes(q) ||
      reel.summary.toLowerCase().includes(q) ||
      reel.creator.toLowerCase().includes(q) ||
      reel.tags.some((t) => t.toLowerCase().includes(q))
    );
  });
}
