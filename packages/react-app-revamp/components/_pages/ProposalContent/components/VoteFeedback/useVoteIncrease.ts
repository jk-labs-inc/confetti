import { useEffect, useRef, useState } from "react";
import { OVERLAY_DURATION_MS } from "./particles";
import { VoteIncreaseState } from "./types";

// Cap on concurrent full particle overlays — a reconnect reconciliation can raise many tallies at
// once, so extra simultaneous overlays are suppressed to bound main-thread cost.
const MAX_PARTICLE_OVERLAYS = 5;
let activeParticleOverlays = 0;

function releaseSlot(holdsSlot: { current: boolean }): void {
  if (holdsSlot.current) {
    holdsSlot.current = false;
    activeParticleOverlays--;
  }
}

// Fires a one-shot signal only when `votes` strictly INCREASES, so re-sorts, the initial mount, and
// downvotes never trigger an effect. The id is monotonic so a fresh increase supersedes an in-flight
// one. `capped` (the heavy perimeter overlay) returns withParticles=false once the cap is saturated.
export function useVoteIncrease(votes: number, capped = false): VoteIncreaseState | null {
  const previousVotes = useRef<number | null>(null);
  const increaseIdRef = useRef(0);
  const cleanupTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const holdsSlot = useRef(false);
  const [state, setState] = useState<VoteIncreaseState | null>(null);

  useEffect(() => {
    const previous = previousVotes.current;
    previousVotes.current = votes;

    if (previous === null || votes <= previous) return;

    if (cleanupTimer.current) clearTimeout(cleanupTimer.current);
    releaseSlot(holdsSlot);

    const id = ++increaseIdRef.current;
    let withParticles = true;
    if (capped) {
      withParticles = activeParticleOverlays < MAX_PARTICLE_OVERLAYS;
      if (withParticles) {
        activeParticleOverlays++;
        holdsSlot.current = true;
      }
    }
    setState({ id, withParticles });

    cleanupTimer.current = setTimeout(() => {
      releaseSlot(holdsSlot);
      setState(current => (current && current.id === id ? null : current));
    }, OVERLAY_DURATION_MS);
  }, [votes, capped]);

  useEffect(
    () => () => {
      clearTimeout(cleanupTimer.current);
      releaseSlot(holdsSlot);
    },
    [],
  );

  return state;
}
