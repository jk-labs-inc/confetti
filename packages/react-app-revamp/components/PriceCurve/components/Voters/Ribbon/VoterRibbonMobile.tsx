import { FC, useCallback, useRef, useState } from "react";
import VoterChip from "../components/VoterChip";
import VoterDrawer from "../components/VoterDrawer";
import VoterRibbonHeader from "../components/VoterRibbonHeader";
import { colorOf } from "@helpers/entryColors";
import { CHIP_GAP, CHIP_W_CSS_MOBILE, RIBBON_FADE } from "../constants";
import { useScrollEdges } from "../hooks/useScrollEdges";
import { useVoterRibbon } from "../hooks/useVoterRibbon";
import { PositionedVote, VoterRibbonProps } from "../types";

/**
 * Mobile: scroll-snap ribbon with a peek of the next chip. The snapped chip drives
 * the on-curve marker; tapping a chip selects it directly (works for every chip,
 * including the last ones that can't be snapped to the start). The drawer is reserved
 * for "view all".
 */
const VoterRibbonMobile: FC<VoterRibbonProps> = ({ votes, entryColors, formatPrice, entryTitlesById, isLive }) => {
  const { ordered, newIds, activeVoteUuid, setActiveVoteUuid } = useVoterRibbon(votes);

  const scrollRef = useRef<HTMLDivElement>(null);
  const ticking = useRef(false);
  const [drawerVoters, setDrawerVoters] = useState<PositionedVote[] | null>(null);
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
    });
  }, [ordered, setActiveVoteUuid]);

  return (
    <div className="mt-2 flex flex-col">
      <VoterRibbonHeader isLive={isLive} onViewAll={() => setDrawerVoters(votes)} />

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
        {ordered.map(vote => (
          <VoterChip
            key={vote.uuid}
            vote={vote}
            color={colorOf(entryColors, vote.proposalId)}
            entryTitle={entryTitlesById.get(vote.proposalId)}
            formatPrice={formatPrice}
            width={CHIP_W_CSS_MOBILE}
            isActive={vote.uuid === activeVoteUuid}
            isNew={newIds.has(vote.uuid)}
            onClick={() => setActiveVoteUuid(vote.uuid)}
          />
        ))}
      </div>

      <VoterDrawer
        isOpen={!!drawerVoters}
        onClose={() => setDrawerVoters(null)}
        voters={drawerVoters ?? []}
        formatPrice={formatPrice}
        entryTitlesById={entryTitlesById}
        entryColors={entryColors}
      />
    </div>
  );
};

export default VoterRibbonMobile;
