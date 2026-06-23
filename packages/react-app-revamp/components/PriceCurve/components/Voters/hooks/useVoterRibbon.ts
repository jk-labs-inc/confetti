import { useCallback, useMemo, useRef } from "react";
import useVoterRibbonStore from "../store";
import { PositionedVote } from "../types";

/**
 * Shared ribbon logic: newest-first ordering + the focused-cast state that syncs
 * the ribbon with the on-curve marker (via the zustand store). Nothing is focused
 * by default — the marker only appears once the viewer hovers/scrolls a chip.
 *
 * `newIds` collects genuinely-live casts so each can play a one-shot entrance animation. A cast is
 * "new" only if it both appears after the first render AND is newer than anything loaded at init —
 * otherwise paging in OLDER history (load-more) would replay the live-arrival animation on it.
 */
export function useVoterRibbon(votes: PositionedVote[]) {
  const ordered = useMemo(() => [...votes].sort((a, b) => b.createdAt - a.createdAt), [votes]);

  const seen = useRef<Set<string> | undefined>(undefined);
  const newIds = useRef<Set<string>>(new Set());
  const initMaxCreatedAt = useRef(-Infinity);
  if (seen.current === undefined) {
    seen.current = new Set(ordered.map(v => v.uuid));
    initMaxCreatedAt.current = ordered.reduce((max, v) => Math.max(max, v.createdAt), -Infinity);
  } else {
    const seenIds = seen.current;
    for (const v of ordered) {
      if (!seenIds.has(v.uuid)) {
        seenIds.add(v.uuid);
        if (v.createdAt > initMaxCreatedAt.current) newIds.current.add(v.uuid);
      }
    }
  }

  const activeVoteUuid = useVoterRibbonStore(state => state.activeVoteUuid);
  const setActiveVoteUuid = useVoterRibbonStore(state => state.setActiveVoteUuid);

  // Drop a cast from the "new" set once its chip has mounted (and thus started its entrance
  // animation). Mutating the ref (no re-render) is intentional — it just stops a windowed
  // unmount/remount from replaying the animation on scroll-back.
  const clearNew = useCallback((uuid: string) => {
    newIds.current.delete(uuid);
  }, []);

  return { ordered, newIds: newIds.current, clearNew, activeVoteUuid, setActiveVoteUuid };
}
