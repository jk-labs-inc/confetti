import { FC, PointerEvent as ReactPointerEvent, useRef, useState, WheelEvent as ReactWheelEvent } from "react";
import VoterChip from "../components/VoterChip";
import VoterRibbonHeader from "../components/VoterRibbonHeader";
import { colorOf } from "@helpers/entryColors";
import { CHIP_W_CSS_DESKTOP, RIBBON_FADE } from "../constants";
import { useScrollEdges } from "../hooks/useScrollEdges";
import { useVoterRibbon } from "../hooks/useVoterRibbon";
import { VoterRibbonProps } from "../types";

const DRAG_THRESHOLD = 4;

/**
 * Desktop: free horizontal scroll (wheel + drag) with fixed-width chips. Hovering
 * a chip previews it on the curve; clicking pins it. No drawer.
 */
const VoterRibbonDesktop: FC<VoterRibbonProps> = ({ votes, entryColors, formatPrice, entryTitlesById, isLive }) => {
  const { ordered, newIds, activeVoteUuid, setActiveVoteUuid } = useVoterRibbon(votes);

  const [pinnedUuid, setPinnedUuid] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ pointerX: 0, startLeft: 0, active: false, moved: 0 });
  const edges = useScrollEdges(scrollRef);

  const onWheel = (e: ReactWheelEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) el.scrollLeft += e.deltaY;
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    drag.current = { pointerX: e.clientX, startLeft: el.scrollLeft, active: true, moved: 0 };
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el || !drag.current.active) return;
    const dx = e.clientX - drag.current.pointerX;
    drag.current.moved = Math.max(drag.current.moved, Math.abs(dx));
    el.scrollLeft = drag.current.startLeft - dx;
  };
  const endDrag = () => {
    drag.current.active = false;
  };

  const revertMarker = () => setActiveVoteUuid(pinnedUuid);

  const selectChip = (uuid: string) => {
    if (drag.current.moved > DRAG_THRESHOLD) return;
    setPinnedUuid(uuid);
    setActiveVoteUuid(uuid);
  };

  return (
    <div className="mt-2 flex flex-col">
      <VoterRibbonHeader isLive={isLive} />

      <div
        ref={scrollRef}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={() => {
          endDrag();
          revertMarker();
        }}
        className="no-scrollbar flex gap-2.5 overflow-x-auto overflow-y-hidden pb-1 pt-0.5"
        style={{
          maskImage: edges.atEnd ? undefined : RIBBON_FADE,
          WebkitMaskImage: edges.atEnd ? undefined : RIBBON_FADE,
          touchAction: "pan-y",
        }}
      >
        {ordered.map(vote => (
          <VoterChip
            key={vote.uuid}
            vote={vote}
            color={colorOf(entryColors, vote.proposalId)}
            entryTitle={entryTitlesById.get(vote.proposalId)}
            formatPrice={formatPrice}
            width={CHIP_W_CSS_DESKTOP}
            isActive={vote.uuid === activeVoteUuid}
            isNew={newIds.has(vote.uuid)}
            onMouseEnter={() => setActiveVoteUuid(vote.uuid)}
            onClick={() => selectChip(vote.uuid)}
          />
        ))}
      </div>
    </div>
  );
};

export default VoterRibbonDesktop;
