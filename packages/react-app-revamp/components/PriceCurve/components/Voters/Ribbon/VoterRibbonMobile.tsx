import { FC, useCallback, useMemo, useRef, useState } from "react";
import VoterChip from "../components/VoterChip";
import VoterDrawer from "../components/VoterDrawer";
import VoterRibbonHeader from "../components/VoterRibbonHeader";
import { colorOf } from "@helpers/entryColors";
import { CHIP_GAP, CHIP_W_CSS_MOBILE, RIBBON_FADE } from "../constants";
import { useVoterRibbon } from "../hooks/useVoterRibbon";
import { PositionedVote, VoterRibbonProps } from "../types";

/**
 * Mobile: scroll-snap ribbon with a peek of the next chip. The centered chip
 * drives the on-curve marker; tapping a chip opens the detail drawer.
 */
const VoterRibbonMobile: FC<VoterRibbonProps> = ({ votes, entryColors, formatPrice, entryTitlesById }) => {
  const { ordered, activeVoteUuid, setActiveVoteUuid } = useVoterRibbon(votes);

  const scrollRef = useRef<HTMLDivElement>(null);
  const ticking = useRef(false);
  const [drawerVoters, setDrawerVoters] = useState<PositionedVote[] | null>(null);

  const castsByAddress = useMemo(() => {
    const map = new Map<string, PositionedVote[]>();
    for (const vote of votes) {
      const key = vote.userAddress.toLowerCase();
      const list = map.get(key);
      if (list) list.push(vote);
      else map.set(key, [vote]);
    }
    return map;
  }, [votes]);

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

  const openVoter = (vote: PositionedVote) =>
    setDrawerVoters(castsByAddress.get(vote.userAddress.toLowerCase()) ?? [vote]);

  return (
    <div className="mt-2 flex flex-col">
      <VoterRibbonHeader onViewAll={() => setDrawerVoters(votes)} />

      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="no-scrollbar flex gap-2.5 overflow-x-auto overflow-y-hidden pb-1 pt-0.5"
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          maskImage: RIBBON_FADE,
          WebkitMaskImage: RIBBON_FADE,
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
            onClick={() => openVoter(vote)}
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
