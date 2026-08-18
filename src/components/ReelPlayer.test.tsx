import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReelPlayer } from "./ReelPlayer";
import type { Reel } from "@/lib/reels";

const reel: Reel = {
  id: "r1",
  title: "Test reel title",
  creator: "Ada Lovelace",
  handle: "@ada",
  summary: "A short summary of the reel.",
  tags: ["agents"],
  duration: 10,
  hue: 120,
  stat: "42 things",
};

function setup(overrides: Partial<Parameters<typeof ReelPlayer>[0]> = {}) {
  const props = {
    reel,
    queued: false,
    onComplete: vi.fn(),
    onLike: vi.fn(),
    onSkip: vi.fn(),
    onPrev: vi.fn(),
    ...overrides,
  };
  render(<ReelPlayer {...props} />);
  return props;
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("ReelPlayer", () => {
  it("labels the player region with the reel and creator", () => {
    setup();
    expect(
      screen.getByRole("region", { name: /now playing: test reel title by ada lovelace/i }),
    ).toBeInTheDocument();
  });

  it("exposes an accessible progress bar", () => {
    setup();
    const bar = screen.getByRole("progressbar", { name: /reel progress/i });
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
    expect(bar).toHaveAttribute("aria-valuenow", "0");
  });

  it("names every control", () => {
    setup();
    expect(screen.getByRole("button", { name: /pause/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /like this reel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /skip to next reel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /previous reel/i })).toBeInTheDocument();
  });

  it("reports liked state via aria-pressed", async () => {
    const user = userEvent.setup();
    const props = setup();
    const like = screen.getByRole("button", { name: /like this reel/i });
    expect(like).toHaveAttribute("aria-pressed", "false");
    await user.click(like);
    expect(props.onLike).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: /like this reel/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("toggles playback from the button", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("button", { name: /pause/i }));
    expect(screen.getByRole("button", { name: /^play$/i })).toBeInTheDocument();
  });

  it("skips and rewinds with the keyboard", async () => {
    const user = userEvent.setup();
    const props = setup();
    await user.keyboard("l");
    expect(props.onSkip).toHaveBeenCalledTimes(1);
    await user.keyboard("j");
    expect(props.onPrev).toHaveBeenCalledTimes(1);
  });

  it("toggles playback with the K shortcut", async () => {
    const user = userEvent.setup();
    setup();
    await user.keyboard("k");
    expect(screen.getByRole("button", { name: /^play$/i })).toBeInTheDocument();
  });

  it("shows the queued badge only when the reel came from recommendations", () => {
    setup({ queued: true });
    expect(screen.getByText(/from your recommendations/i)).toBeInTheDocument();
  });

  it("calls onComplete once the reel finishes playing", () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    render(
      <ReelPlayer
        reel={reel}
        queued={false}
        onComplete={onComplete}
        onLike={vi.fn()}
        onSkip={vi.fn()}
        onPrev={vi.fn()}
      />,
    );
    act(() => {
      vi.advanceTimersByTime(reel.duration * 1000 + 200);
    });
    expect(onComplete).toHaveBeenCalled();
  });

  it("renders the title as a heading and lists the topic tags", () => {
    setup();
    expect(screen.getByRole("heading", { name: /test reel title/i })).toBeInTheDocument();
    expect(screen.getByText(/agents/i)).toBeInTheDocument();
  });
});
