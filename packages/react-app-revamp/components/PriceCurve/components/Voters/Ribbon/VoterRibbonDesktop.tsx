import { useVirtualizer } from "@tanstack/react-virtual";
import {
  FC,
  PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  WheelEvent as ReactWheelEvent,
} from "react";
import VoterChip, { voterChipData } from "../components/VoterChip";
import VoterRibbonHeader from "../components/VoterRibbonHeader";
import { CHIP_GAP, DESKTOP_CHIP_W, RIBBON_FADE } from "../constants";
import { useScrollEdges } from "../hooks/useScrollEdges";
import { useVoterRibbon } from "../hooks/useVoterRibbon";
import { VoterRibbonProps } from "../types";

const DRAG_THRESHOLD = 4;
const FALLBACK_CHIP_H = 108;
const LOAD_MORE_THRESHOLD = 5;

const VoterRibbonDesktop: FC<VoterRibbonProps> = ({
  votes,
  entryColors,
  formatPrice,
  entryTitlesById,
  isLive,
  onLoadMore,
  hasMore,
  isLoadingMore,
}) => {
  const { ordered, newIds, clearNew, activeVoteUuid, setActiveVoteUuid } = useVoterRibbon(votes);

  const [pinnedUuid, setPinnedUuid] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ pointerX: 0, startLeft: 0, active: false, moved: 0 });
  const edges = useScrollEdges(scrollRef);

  const virtualizer = useVirtualizer({
    count: ordered.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => DESKTOP_CHIP_W + CHIP_GAP,
    horizontal: true,
    overscan: 6,
    getItemKey: index => ordered[index].uuid,
  });

  const [chipH, setChipH] = useState(FALLBACK_CHIP_H);
  const measureRef = useCallback((node: HTMLDivElement | null) => {
    if (node) setChipH(prev => (prev === FALLBACK_CHIP_H ? node.offsetHeight : prev));
  }, []);

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

  const onHover = useCallback((uuid: string) => setActiveVoteUuid(uuid), [setActiveVoteUuid]);
  const onSelect = useCallback(
    (uuid: string) => {
      if (drag.current.moved > DRAG_THRESHOLD) return;
      setPinnedUuid(uuid);
      setActiveVoteUuid(uuid);
    },
    [setActiveVoteUuid],
  );

  const items = virtualizer.getVirtualItems();

  const lastIndex = items.length > 0 ? items[items.length - 1].index : 0;
  const requestedAtLen = useRef(0);
  useEffect(() => {
    if (!hasMore || isLoadingMore) return;
    if (lastIndex < ordered.length - 1 - LOAD_MORE_THRESHOLD) return;
    if (ordered.length === requestedAtLen.current) return;
    requestedAtLen.current = ordered.length;
    onLoadMore?.();
  }, [hasMore, isLoadingMore, lastIndex, ordered.length, onLoadMore]);

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
        className="no-scrollbar overflow-x-auto overflow-y-hidden pb-1 pt-0.5"
        style={{
          maskImage: edges.atEnd ? undefined : RIBBON_FADE,
          WebkitMaskImage: edges.atEnd ? undefined : RIBBON_FADE,
          touchAction: "pan-y",
        }}
      >
        <div style={{ position: "relative", width: Math.max(0, virtualizer.getTotalSize() - CHIP_GAP), height: chipH }}>
          {items.map((item, i) => {
            const vote = ordered[item.index];
            return (
              <div
                key={item.key}
                ref={i === 0 ? measureRef : undefined}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: DESKTOP_CHIP_W,
                  transform: `translateX(${item.start}px)`,
                }}
              >
                <VoterChip
                  {...voterChipData(vote, entryColors, entryTitlesById, formatPrice)}
                  width="100%"
                  isActive={vote.uuid === activeVoteUuid}
                  isNew={newIds.has(vote.uuid)}
                  onHover={onHover}
                  onSelect={onSelect}
                  onSeen={clearNew}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VoterRibbonDesktop;
