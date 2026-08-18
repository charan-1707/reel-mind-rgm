import { useEffect, useRef, useState } from "react";
import { Heart, Pause, Play, SkipForward, ChevronUp, Volume2 } from "lucide-react";
import { Poster } from "./Poster";
import { TAG_LABEL, type Reel } from "@/lib/reels";
import { progressStep, remainingSeconds } from "@/lib/format";

/**
 * Simulated reel player with a progress bar, like/skip/back controls and
 * keyboard shortcuts (space or K toggles play, J goes back, L skips).
 */
export function ReelPlayer({
  reel,
  queued,
  onComplete,
  onLike,
  onSkip,
  onPrev,
}: {
  reel: Reel;
  queued: boolean;
  onComplete: () => void;
  onLike: () => void;
  onSkip: () => void;
  onPrev: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [liked, setLiked] = useState(false);
  const completed = useRef(false);

  useEffect(() => {
    setProgress(0);
    setLiked(false);
    setPlaying(true);
    completed.current = false;
  }, [reel.id]);

  useEffect(() => {
    if (!playing) return;
    const step = progressStep(reel.duration);
    const t = setInterval(() => {
      setProgress((p) => {
        const next = p + step;
        if (next >= 100 && !completed.current) {
          completed.current = true;
          onComplete();
          return 0;
        }
        return next >= 100 ? 0 : next;
      });
    }, 100);
    return () => clearInterval(t);
  }, [playing, reel.id, reel.duration, onComplete]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      const key = e.key.toLowerCase();
      if (key === " " || key === "k") {
        e.preventDefault();
        setPlaying((p) => !p);
      } else if (key === "j") {
        onPrev();
      } else if (key === "l") {
        onSkip();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onPrev, onSkip]);

  const remaining = remainingSeconds(reel.duration, progress);

  return (
    <section
      aria-label={`Now playing: ${reel.title} by ${reel.creator}`}
      className="relative aspect-[9/14] w-full overflow-hidden rounded-xl border border-border bg-card sm:aspect-[9/13]"
    >
      <Poster reel={reel} className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,transparent_35%,oklch(0.16_0.014_165/0.55))]" />

      <div className="absolute inset-x-0 top-0 flex items-center gap-3 p-4">
        <div
          role="progressbar"
          aria-label="Reel progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          aria-valuetext={`${Math.round(progress)}% played, ${remaining} seconds left`}
          className="h-[3px] flex-1 overflow-hidden rounded-full bg-foreground/20"
        >
          <div
            className="h-full bg-primary transition-[width] duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="label text-foreground/70">{remaining}s</span>
      </div>

      <p className="sr-only" aria-live="polite">
        {playing ? "Playing" : "Paused"}: {reel.title} by {reel.creator}
      </p>
      <p className="sr-only">
        Keyboard shortcuts: press space or K to play or pause, J for the previous reel, L to
        skip.
      </p>

      {queued && (
        <span className="absolute left-4 top-12 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground">
          From your recommendations
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 space-y-4 p-5 sm:p-7">
        <div className="flex flex-wrap gap-2">
          {reel.tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-border/80 bg-surface/70 px-2.5 py-1 text-[11px] tracking-wide text-muted-foreground backdrop-blur"
            >
              {TAG_LABEL[t] ?? t}
            </span>
          ))}
        </div>
        <h2 className="max-w-[26ch] text-2xl leading-[1.05] font-semibold sm:text-3xl">
          {reel.title}
        </h2>
        <p className="max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
          {reel.summary}
        </p>
        <div className="flex items-center justify-between gap-4 pt-1">
          <div>
            <p className="text-sm font-medium">{reel.creator}</p>
            <p className="text-xs text-muted-foreground">
              {reel.handle} · {reel.stat}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              aria-label={playing ? "Pause" : "Play"}
              onClick={() => setPlaying((p) => !p)}
              className="grid size-11 place-items-center rounded-full border border-border bg-surface/80 backdrop-blur transition-colors hover:border-primary"
            >
              {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            </button>
            <button
              aria-label="Like this reel"
              aria-pressed={liked}
              onClick={() => {
                setLiked(true);
                onLike();
              }}
              className={`grid size-11 place-items-center rounded-full border backdrop-blur transition-colors ${
                liked
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface/80 hover:border-primary"
              }`}
            >
              <Heart className={`size-4 ${liked ? "fill-current" : ""}`} />
            </button>
            <button
              aria-label="Skip to next reel"
              onClick={onSkip}
              className="grid size-11 place-items-center rounded-full border border-border bg-surface/80 backdrop-blur transition-colors hover:border-primary"
            >
              <SkipForward className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <button
        aria-label="Previous reel"
        onClick={onPrev}
        className="absolute right-4 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-border/60 bg-surface/50 text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
      >
        <ChevronUp className="size-4" />
      </button>
      <span className="absolute right-4 top-12 hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
        <Volume2 className="size-3.5" /> ambient
      </span>
    </section>
  );
}
