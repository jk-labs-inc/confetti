import { useMemo } from "react";
import useVoterRibbonStore from "../store";
import { PositionedVote } from "../types";

/**
 * Shared ribbon logic: newest-first ordering + the focused-cast state that syncs
 * the ribbon with the on-curve marker (via the zustand store). Nothing is focused
 * by default — the marker only appears once the viewer hovers/scrolls a chip.
 */
export function useVoterRibbon(votes: PositionedVote[]) {
  const ordered = useMemo(() => [...votes].sort((a, b) => b.createdAt - a.createdAt), [votes]);

  const activeVoteUuid = useVoterRibbonStore(state => state.activeVoteUuid);
  const setActiveVoteUuid = useVoterRibbonStore(state => state.setActiveVoteUuid);

  return { ordered, activeVoteUuid, setActiveVoteUuid };
}
