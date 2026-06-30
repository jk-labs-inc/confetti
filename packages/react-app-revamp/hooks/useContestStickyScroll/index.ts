import { RefObject, useEffect } from "react";
import { useContestStickyStore } from "../useContestStickyStore";

/**
 * Drives the contest header's "compact" state from scroll position: false while
 * the header sits at its natural spot, true once it docks to the top of its
 * scroll context. A sentinel placed right before the header is observed against
 * the relevant root, so this works for both window scroll and the dual-pane
 * container scroll.
 */
export const useContestStickyScroll = (
  sentinelRef: RefObject<HTMLElement | null>,
  scrollContainerRef?: RefObject<HTMLElement | null>,
  useContainerScroll = false,
) => {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const root = useContainerScroll ? (scrollContainerRef?.current ?? null) : null;
    const { setIsCompact } = useContestStickyStore.getState();

    const observer = new IntersectionObserver(([entry]) => setIsCompact(!entry.isIntersecting), {
      root,
      threshold: 0,
    });
    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [sentinelRef, scrollContainerRef, useContainerScroll]);
};
