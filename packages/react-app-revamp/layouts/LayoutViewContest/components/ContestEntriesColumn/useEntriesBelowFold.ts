import { useProposalStore } from "@hooks/useProposal/store";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";

const ENTRY_CARD_SELECTOR = "[data-entry-id]";
const NO_VISIBLE_ENTRY = -1;

export const useEntriesBelowFold = (scrollRoot: HTMLElement | null): number => {
  const { submissionsCount, loadedIds } = useProposalStore(
    useShallow(state => ({
      submissionsCount: state.submissionsCount,
      loadedIds: state.listProposalsData.map(proposal => proposal.id).join(","),
    })),
  );
  const [maxVisibleIndex, setMaxVisibleIndex] = useState(NO_VISIBLE_ENTRY);

  useEffect(() => {
    if (!scrollRoot) return;

    const indexById = new Map(loadedIds.split(",").map((id, index) => [id, index]));
    const visibleIndexes = new Set<number>();
    const observedCards = new Set<HTMLElement>();
    const indexOfCard = (card: HTMLElement) => indexById.get(card.dataset.entryId ?? "");
    const publish = () => setMaxVisibleIndex(visibleIndexes.size > 0 ? Math.max(...visibleIndexes) : NO_VISIBLE_ENTRY);

    const intersectionObserver = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          const index = indexOfCard(entry.target as HTMLElement);
          if (index === undefined) continue;
          if (entry.isIntersecting) visibleIndexes.add(index);
          else visibleIndexes.delete(index);
        }
        publish();
      },
      { root: scrollRoot, threshold: 0 },
    );

    const observeCard = (card: HTMLElement) => {
      if (observedCards.has(card)) return;
      observedCards.add(card);
      intersectionObserver.observe(card);
    };

    const observeCardsIn = (node: Node) => {
      if (!(node instanceof HTMLElement)) return;
      if (node.matches(ENTRY_CARD_SELECTOR)) observeCard(node);
      node.querySelectorAll<HTMLElement>(ENTRY_CARD_SELECTOR).forEach(observeCard);
    };

    const forgetDetachedCards = () => {
      let hasVisibilityChange = false;
      for (const card of observedCards) {
        if (card.isConnected) continue;
        observedCards.delete(card);
        intersectionObserver.unobserve(card);
        const index = indexOfCard(card);
        if (index !== undefined && visibleIndexes.delete(index)) hasVisibilityChange = true;
      }
      if (hasVisibilityChange) publish();
    };

    observeCardsIn(scrollRoot);
    if (observedCards.size === 0) publish();

    const mutationObserver = new MutationObserver(records => {
      let hasRemovals = false;
      for (const record of records) {
        record.addedNodes.forEach(node => observeCardsIn(node));
        if (record.removedNodes.length > 0) hasRemovals = true;
      }
      if (hasRemovals) forgetDetachedCards();
    });
    mutationObserver.observe(scrollRoot, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [scrollRoot, loadedIds]);

  if (maxVisibleIndex === NO_VISIBLE_ENTRY) return 0;
  return Math.max(0, submissionsCount - (maxVisibleIndex + 1));
};
