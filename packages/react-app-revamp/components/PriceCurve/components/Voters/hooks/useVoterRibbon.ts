import { useMemo, useRef } from "react";
import useVoterRibbonStore from "../store";
import { PositionedVote } from "../types";

/**
 * Shared ribbon logic: newest-first ordering + the focused-cast state that syncs
 * the ribbon with the on-curve marker (via the zustand store). Nothing is focused
 * by default — the marker only appears once the viewer hovers/scrolls a chip.
 *
 * `newIds` collects casts that appear after the first render (live votes) so each can
 * play a one-shot entrance animation; the initial batch is never animated.
 */
export function useVoterRibbon(votes: PositionedVote[]) {
  const ordered = useMemo(() => [...votes].sort((a, b) => b.createdAt - a.createdAt), [votes]);

  const seen = useRef<Set<string> | undefined>(undefined);
  const newIds = useRef<Set<string>>(new Set());
  if (seen.current === undefined) {
    seen.current = new Set(ordered.map(v => v.uuid));
  } else {
    const seenIds = seen.current;
    for (const v of ordered) {
      if (!seenIds.has(v.uuid)) {
        seenIds.add(v.uuid);
        newIds.current.add(v.uuid);
      }
    }
  }

  const activeVoteUuid = useVoterRibbonStore(state => state.activeVoteUuid);
  const setActiveVoteUuid = useVoterRibbonStore(state => state.setActiveVoteUuid);

  return { ordered, newIds: newIds.current, activeVoteUuid, setActiveVoteUuid };
}
