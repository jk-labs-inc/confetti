import { FC, useCallback, useMemo, useRef, useState } from "react";
import VoterChip, { voterChipData } from "../components/VoterChip";
import VoterDrawer from "../components/VoterDrawer";
import VoterRibbonHeader from "../components/VoterRibbonHeader";
import { CHIP_GAP, CHIP_W_CSS_MOBILE, LOAD_MORE_THRESHOLD, RIBBON_FADE } from "../constants";
import { useScrollEdges } from "../hooks/useScrollEdges";
import { useVoterRibbon } from "../hooks/useVoterRibbon";
import { VoterRibbonProps } from "../types";

const VoterRibbonMobile: FC<VoterRibbonProps> = ({
  votes,
  rankById,
  formatPrice,
  entryTitlesById,
  isLive,
  onLoadMore,
  hasMore,
  isLoadingMore,
}) => {
  const { ordered, newIds, clearNew, activeVoteUuid, setActiveVoteUuid } = useVoterRibbon(votes);
  const chips = useMemo(
    () => ordered.map(vote => voterChipData(vote, rankById, entryTitlesById, formatPrice)),
    [ordered, rankById, entryTitlesById, formatPrice],
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const ticking = useRef(false);
  const requestedAtLen = useRef(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const edges = useScrollEdges(scrollRef);

  const onScroll = useCallback(() => {
    if (ticking.current) return;
    ticking.current = true;
    requestAnimationFrame(() => {
      ticking.current = false;
      const el = scrollRef.current;
      if (!el) return;
      const first = el.firstElementChild as HTMLElement | null;
      const step = first ? first.offsetWidth + CHIP_GAP : 1;
      const idx = Math.max(0, Math.min(ordered.length - 1, Math.round(el.scrollLeft / step)));
      const uuid = ordered[idx]?.uuid;
      if (uuid) setActiveVoteUuid(uuid);

      if (
        hasMore &&
        !isLoadingMore &&
        idx >= ordered.length - 1 - LOAD_MORE_THRESHOLD &&
        ordered.length !== requestedAtLen.current
      ) {
        requestedAtLen.current = ordered.length;
        onLoadMore?.();
      }
    });
  }, [ordered, setActiveVoteUuid, hasMore, isLoadingMore, onLoadMore]);

  const onSelect = useCallback((uuid: string) => setActiveVoteUuid(uuid), [setActiveVoteUuid]);

  return (
    <div className="mt-2 flex flex-col">
      <VoterRibbonHeader isLive={isLive} onViewAll={() => setDrawerOpen(true)} />

      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="no-scrollbar flex gap-2.5 overflow-x-auto overflow-y-hidden pb-1 pt-0.5"
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          maskImage: edges.atEnd ? undefined : RIBBON_FADE,
          WebkitMaskImage: edges.atEnd ? undefined : RIBBON_FADE,
        }}
      >
        {chips.map(chip => (
          <VoterChip
            key={chip.uuid}
            {...chip}
            width={CHIP_W_CSS_MOBILE}
            isActive={chip.uuid === activeVoteUuid}
            isNew={newIds.has(chip.uuid)}
            onSelect={onSelect}
            onSeen={clearNew}
          />
        ))}
      </div>

      <VoterDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        voters={votes}
        formatPrice={formatPrice}
        entryTitlesById={entryTitlesById}
        rankById={rankById}
        onLoadMore={onLoadMore}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
      />
    </div>
  );
};

export default VoterRibbonMobile;
