import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: null, session: null, loading: false }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({ order: () => Promise.resolve({ data: null, error: null }) }),
      delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
      insert: () => Promise.resolve({ error: null }),
    }),
  },
}));

import { FeedProvider, useFeed } from "./feed-store";
import { GUEST_KEY, readGuestState } from "./guest-storage";

function Harness() {
  const { reels, interactions, queue, isGuest, loading, record, enqueue, dequeue, resetProfile } =
    useFeed();
  return (
    <div>
      <p data-testid="state">
        {String(isGuest)}|{String(loading)}|{reels.length}|{interactions.length}|{queue.length}
      </p>
      <button onClick={() => record("r1", "liked")}>like</button>
      <button onClick={() => enqueue("r2")}>queue</button>
      <button onClick={() => dequeue("r2")}>dequeue</button>
      <button onClick={resetProfile}>reset</button>
    </div>
  );
}

const state = () => screen.getByTestId("state").textContent!.split("|");

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
});

describe("FeedProvider (guest)", () => {
  it("falls back to the bundled catalogue and marks the visitor as a guest", async () => {
    render(
      <FeedProvider>
        <Harness />
      </FeedProvider>,
    );
    await waitFor(() => expect(state()[1]).toBe("false"));
    expect(state()[0]).toBe("true");
    expect(Number(state()[2])).toBeGreaterThan(0);
  });

  it("records interactions and persists them for the device", async () => {
    const user = userEvent.setup();
    render(
      <FeedProvider>
        <Harness />
      </FeedProvider>,
    );
    await waitFor(() => expect(state()[1]).toBe("false"));
    await user.click(screen.getByRole("button", { name: "like" }));
    expect(Number(state()[3])).toBe(1);
    expect(readGuestState().interactions[0]).toMatchObject({ reelId: "r1", action: "liked" });
  });

  it("queues and dequeues without duplicates", async () => {
    const user = userEvent.setup();
    render(
      <FeedProvider>
        <Harness />
      </FeedProvider>,
    );
    await waitFor(() => expect(state()[1]).toBe("false"));
    await user.click(screen.getByRole("button", { name: "queue" }));
    await user.click(screen.getByRole("button", { name: "queue" }));
    expect(Number(state()[4])).toBe(1);
    await user.click(screen.getByRole("button", { name: "dequeue" }));
    expect(Number(state()[4])).toBe(0);
  });

  it("resets the profile and clears local storage", async () => {
    const user = userEvent.setup();
    render(
      <FeedProvider>
        <Harness />
      </FeedProvider>,
    );
    await waitFor(() => expect(state()[1]).toBe("false"));
    await user.click(screen.getByRole("button", { name: "like" }));
    await user.click(screen.getByRole("button", { name: "reset" }));
    expect(Number(state()[3])).toBe(0);
    expect(readGuestState().interactions).toEqual([]);
  });

  it("rehydrates a stored guest profile on mount", async () => {
    window.localStorage.setItem(
      GUEST_KEY,
      JSON.stringify({
        interactions: [{ id: "i1", reelId: "r1", action: "watched", at: 1 }],
        queue: ["r5"],
      }),
    );
    render(
      <FeedProvider>
        <Harness />
      </FeedProvider>,
    );
    await waitFor(() => expect(state()[1]).toBe("false"));
    expect(Number(state()[3])).toBe(1);
    expect(Number(state()[4])).toBe(1);
  });
});
