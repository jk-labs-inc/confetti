import { ContestStatus } from "@hooks/useContestStatus/store";
import { EntryPreview } from "@hooks/useDeployContest/slices/contestMetadataSlice";
import { MOBILE_NAV_SLOT_ID } from "@hooks/useMobileNavSlot";
import { ProposalCore } from "@hooks/useProposal/store";
import { animate, useMotionValue } from "motion/react";
import { FC, PointerEvent as ReactPointerEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import EntryCard from "./EntryCard";
import { useEntryFeed } from "./useEntryFeed";
import {
  CARD_ASPECT,
  CARD_WIDTH_PCT,
  DEPTH_PX,
  DRAG_THRESHOLD,
  FILL_BOTTOM_GAP_PX,
  FLICK_PROJECTION_S,
  MAX_FILL_ASPECT,
  MAX_FLICK,
  MAX_OPACITY_DROP,
  MAX_ROTATE_DEG,
  MAX_SCALE_DROP,
  MAX_VISIBLE,
  NEIGHBOR_SPACING_PCT,
  PERSPECTIVE_PX,
  TWEET_CARD_ASPECT,
  TWO_UP_DIM_OPACITY,
  TWO_UP_GAP_PX,
  WINDOW_RADIUS,
} from "./constants";

interface EntryCarouselProps {
  proposals: ProposalCore[];
  enabledPreview: EntryPreview | null;
  contestStatus: ContestStatus;
  hasNextPage: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

const EntryCarousel: FC<EntryCarouselProps> = ({
  proposals,
  enabledPreview,
  contestStatus,
  hasNextPage,
  isLoadingMore,
  onLoadMore,
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pos = useMotionValue(0);
  const drag = useRef({ active: false, startX: 0, startPos: 0, moved: 0 });
  const activeRef = useRef(0);
  const [stageWidth, setStageWidth] = useState(0);
  const [activeIdx, setActiveIdx] = useState(0);
  const [availableH, setAvailableH] = useState(0);

  const { cards, n, totalVotes, maybeLoadMore } = useEntryFeed({
    proposals,
    activeIndex: activeIdx,
    hasNextPage,
    isLoadingMore,
    onLoadMore,
  });

  // tweet entries get a taller card so the embedded tweet fits without being cut off; image/title keep the default
  const isTweetPreview = enabledPreview === EntryPreview.TWEET || enabledPreview === EntryPreview.TWEET_AND_TITLE;
  const cardAspect = isTweetPreview ? TWEET_CARD_ASPECT : CARD_ASPECT;
  const cardW = stageWidth * (CARD_WIDTH_PCT / 100);
  const naturalCardH = cardW * cardAspect;
  const spacing = stageWidth * (NEIGHBOR_SPACING_PCT / 100);

  // A 2-item ring can't be balanced (the lone neighbor always lands one step to the right, leaving the left
  // empty), so render exactly-2 entries as a centered two-up where tapping a card makes it the active vote target.
  const isTwoUp = n === 2 && !hasNextPage;
  const twoUpCardW = Math.max(0, (stageWidth - TWO_UP_GAP_PX) / 2);
  const naturalTwoUpH = twoUpCardW * cardAspect;

  const votingOpen = contestStatus === ContestStatus.VotingOpen;
  const fillVoidHeight = (natW: number, natH: number) =>
    !votingOpen && availableH > natH ? Math.min(availableH, natW * MAX_FILL_ASPECT) : natH;
  const cardH = fillVoidHeight(cardW, naturalCardH);
  const twoUpCardH = fillVoidHeight(twoUpCardW, naturalTwoUpH);
  const containerH = isTwoUp ? twoUpCardH : cardH;

  const mountedWindow = useMemo(() => {
    const s = new Set<number>();
    if (n === 0) return s;
    for (let d = -WINDOW_RADIUS; d <= WINDOW_RADIUS; d++) s.add((((activeIdx + d) % n) + n) % n);
    return s;
  }, [activeIdx, n]);

  const circularDelta = useCallback(
    (i: number, p: number) => {
      if (n === 0) return 0;
      let d = (((i - p) % n) + n) % n;
      if (d > n / 2) d -= n;
      return d;
    },
    [n],
  );

  // position every card around the ring for a given fractional position (imperative; runs on the motion value)
  const layout = useCallback(
    (p: number) => {
      const stage = stageRef.current;
      if (!stage) return;
      for (let i = 0; i < stage.children.length; i++) {
        const el = stage.children[i] as HTMLElement;
        const delta = circularDelta(i, p);
        const abs = Math.abs(delta);
        if (abs > MAX_VISIBLE + 1) {
          if (el.style.opacity !== "0") {
            el.style.opacity = "0";
            el.style.pointerEvents = "none";
          }
          continue;
        }
        const dir = Math.max(-1, Math.min(1, delta));
        const x = delta * spacing;
        const z = -Math.min(abs, MAX_VISIBLE) * DEPTH_PX;
        const rotateY = -dir * MAX_ROTATE_DEG;
        const scale = 1 - MAX_SCALE_DROP * Math.min(1, abs);
        const visible = abs <= MAX_VISIBLE + 0.5;
        el.style.transform = `translate(-50%, -50%) translateX(${x.toFixed(1)}px) translateZ(${z.toFixed(
          1,
        )}px) rotateY(${rotateY.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
        el.style.opacity = visible ? (1 - MAX_OPACITY_DROP * Math.min(1, abs)).toFixed(3) : "0";
        el.style.zIndex = String(1000 - Math.round(abs * 10));
        el.style.pointerEvents = visible ? "auto" : "none";
      }
    },
    [circularDelta, spacing],
  );

  // highlight whichever card is currently closest to center — updates live while rotating, not only on settle
  const updateActive = useCallback(
    (p: number) => {
      if (n === 0 || isTwoUp) return;
      const norm = ((Math.round(p) % n) + n) % n;
      if (norm !== activeRef.current) {
        activeRef.current = norm;
        setActiveIdx(norm);
      }
    },
    [n, isTwoUp],
  );

  useEffect(() => {
    const handler = (p: number) => {
      layout(p);
      updateActive(p);
    };
    handler(pos.get());
    const unsub = pos.on("change", handler);
    return () => unsub();
  }, [layout, updateActive, pos]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(() => setStageWidth(wrap.clientWidth));
    ro.observe(wrap);
    setStageWidth(wrap.clientWidth);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const measure = () => {
      const slot = document.getElementById(MOBILE_NAV_SLOT_ID);
      const floor = slot ? slot.getBoundingClientRect().top : window.innerHeight;
      const top = wrap.getBoundingClientRect().top;
      setAvailableH(Math.max(0, floor - top - FILL_BOTTOM_GAP_PX));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [stageWidth, n, contestStatus]);

  // re-layout when sizing or the entry set changes
  useEffect(() => {
    layout(pos.get());
  }, [stageWidth, cards]);

  const snapTo = useCallback(
    (target: number) => {
      animate(pos, target, {
        type: "spring",
        stiffness: 320,
        damping: 34,
        onComplete: () => {
          // keep the value bounded; circular layout makes this jump invisible
          const norm = n > 0 ? ((Math.round(target) % n) + n) % n : 0;
          pos.set(norm);
          maybeLoadMore(norm);
        },
      });
    },
    [pos, n, maybeLoadMore],
  );

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    pos.jump(pos.get());
    drag.current = { active: true, startX: e.clientX, startPos: pos.get(), moved: 0 };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d.active || spacing === 0) return;
    const dx = e.clientX - d.startX;
    d.moved = Math.max(d.moved, Math.abs(dx));
    pos.set(d.startPos - dx / spacing);
  };

  const onPointerUp = () => {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;
    const v = pos.getVelocity();
    const base = Math.round(pos.get());
    const projected = Math.round(pos.get() + v * FLICK_PROJECTION_S);
    const target = Math.max(base - MAX_FLICK, Math.min(base + MAX_FLICK, projected));
    snapTo(target);
  };

  const handleCardClick = (index: number) => {
    if (drag.current.moved > DRAG_THRESHOLD) return; // it was a drag, not a tap
    const cur = pos.get();
    snapTo(cur + circularDelta(index, cur)); // rotate the tapped card to center
  };

  if (n === 0) return null;

  return (
    <div
      ref={wrapRef}
      className={`relative w-full select-none ${isTwoUp ? "" : "touch-pan-y overflow-hidden"}`}
      style={{ height: containerH ? `${containerH}px` : undefined }}
    >
      {isTwoUp ? (
        <div className="absolute inset-0 flex justify-center" style={{ gap: `${TWO_UP_GAP_PX}px` }}>
          {cards.map((proposal, index) => {
            const isActive = index === activeIdx;
            const isActiveTarget = votingOpen && isActive;
            return (
              <div
                key={proposal.id}
                onClick={
                  votingOpen
                    ? () => {
                        activeRef.current = index;
                        setActiveIdx(index);
                      }
                    : undefined
                }
                className={`h-full min-w-0 flex-1 transition-opacity duration-200 ${votingOpen ? "cursor-pointer" : ""}`}
                style={{ opacity: !votingOpen || isActive ? 1 : TWO_UP_DIM_OPACITY }}
              >
                <EntryCard
                  proposal={proposal}
                  enabledPreview={enabledPreview}
                  contestStatus={contestStatus}
                  totalVotes={totalVotes}
                  active={isActiveTarget}
                  elevated
                  compact
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div
          ref={stageRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="absolute inset-0"
          style={{ perspective: `${PERSPECTIVE_PX}px`, perspectiveOrigin: "50% 50%" }}
        >
          {cards.map((proposal, index) => {
            const isActive = index === activeIdx;
            const isActiveTarget = votingOpen && isActive;
            const mounted = mountedWindow.has(index);
            return (
              <div
                key={proposal.id}
                onClick={() => handleCardClick(index)}
                className={`absolute left-1/2 top-1/2 cursor-pointer ${mounted ? "will-change-transform" : ""}`}
                style={{ width: cardW ? `${cardW}px` : `${CARD_WIDTH_PCT}%`, height: cardH ? `${cardH}px` : undefined }}
              >
                {mounted ? (
                  <EntryCard
                    proposal={proposal}
                    enabledPreview={enabledPreview}
                    contestStatus={contestStatus}
                    totalVotes={totalVotes}
                    active={isActiveTarget}
                    elevated={isActive}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EntryCarousel;
