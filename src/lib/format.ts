import { INTEREST_MAX } from "./scoring";

/** Seconds still to play, given a 0-100 progress value. Never negative. */
export function remainingSeconds(duration: number, progress: number): number {
  const clamped = Math.min(100, Math.max(0, progress));
  return Math.max(0, Math.round(duration * (1 - clamped / 100)));
}

/** Percentage step added to the progress bar every 100ms tick. */
export function progressStep(duration: number): number {
  if (duration <= 0) return 100;
  return 100 / (duration * 10);
}

/** Width (0-100) of an interest bar, scaled against a readable ceiling. */
export function interestBarWidth(value: number, ceiling = INTEREST_MAX * 0.67): number {
  if (ceiling <= 0) return 0;
  return Math.min(100, (Math.abs(value) / ceiling) * 100);
}

/** Signed, one-decimal interest label, e.g. `+2.5` or `-1.4`. */
export function formatInterest(value: number): string {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}`;
}
