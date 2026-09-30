import { Proposal } from "@components/_pages/ProposalContent";
import { toContentProposal } from "@components/_pages/ProposalContent/toContentProposal";
import { useCastVotesStore } from "@hooks/useCastVotes/store";
import { ProposalCore, useProposalStore } from "@hooks/useProposal/store";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { LOAD_MORE_THRESHOLD } from "./constants";

interface UseEntryFeedParams {
  proposals: ProposalCore[];
  activeIndex: number;
  hasNextPage: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

interface UseEntryFeedResult {
  cards: Proposal[];
  n: number;
  totalVotes: number;
  pendingTargetIndex: number | null;
  maybeLoadMore: (index: number) => void;
}

export function useEntryFeed({
  proposals,
  activeIndex,
  hasNextPage,
  isLoadingMore,
  onLoadMore,
}: UseEntryFeedParams): UseEntryFeedResult {
  const orderRef = useRef<string[]>([]);
  const cards = useMemo(() => {
    const byId = new Map(proposals.map(p => [p.id, p]));
    const order = orderRef.current.filter(id => byId.has(id));
    const seen = new Set(order);
    for (const p of proposals) {
      if (!seen.has(p.id)) order.push(p.id);
    }
    orderRef.current = order;
    return order.map(id => toContentProposal(byId.get(id)!));
  }, [proposals]);
  const n = cards.length;

  const initialMappedProposalIds = useProposalStore(state => state.initialMappedProposalIds);
  const totalVotes = useMemo(
    () => initialMappedProposalIds.reduce((sum, p) => sum + p.votes, 0),
    [initialMappedProposalIds],
  );

  const setPickedProposal = useCastVotesStore(state => state.setPickedProposal);
  const pickedProposal = useCastVotesStore(state => state.pickedProposal);

  const lastTargetRef = useRef<string | null>(null);

  useEffect(() => {
    if (n === 0) return;
    const centeredId = cards[Math.min(activeIndex, n - 1)]?.id;
    if (centeredId && centeredId !== lastTargetRef.current) {
      lastTargetRef.current = centeredId;
      setPickedProposal(centeredId);
    }
  }, [activeIndex, cards, n, setPickedProposal]);

  const pendingTargetIndex = useMemo(() => {
    if (!pickedProposal || lastTargetRef.current === null || pickedProposal === lastTargetRef.current) return null;
    const index = cards.findIndex(card => card.id === pickedProposal);
    return index >= 0 ? index : null;
  }, [pickedProposal, cards]);

  const requestedAtLen = useRef(0);
  const maybeLoadMore = useCallback(
    (index: number) => {
      if (n === 0) return;
      const norm = ((index % n) + n) % n;
      if (hasNextPage && !isLoadingMore && norm >= n - 1 - LOAD_MORE_THRESHOLD && n !== requestedAtLen.current) {
        requestedAtLen.current = n;
        onLoadMore();
      }
    },
    [n, hasNextPage, isLoadingMore, onLoadMore],
  );

  return { cards, n, totalVotes, pendingTargetIndex, maybeLoadMore };
}
