import { ContestStatus } from "@hooks/useContestStatus/store";
import { EntryPreview } from "@hooks/useDeployContest/slices/contestMetadataSlice";
import { MOBILE_NAV_SLOT_ID } from "@hooks/useMobileNavSlot";
import { ProposalCore } from "@hooks/useProposal/store";
import { animate, useMotionValue } from "motion/react";
import { FC, PointerEvent as ReactPointerEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import EntryCard from "./EntryCard";
import { useEntryFeed } from "./useEntryFeed";
import {
  BOUNDED_END_SHIFT,
  CARD_ASPECT,
  CARD_WIDTH_PCT,
  DEPTH_PX,
  DRAG_THRESHOLD,
  DRAG_THRESHOLD_TOUCH,
  FILL_BOTTOM_GAP_PX,
  FLICK_MIN_TRAVEL,
  FLICK_MIN_VELOCITY,
  FLICK_PROJECTION_S,
  MAX_FILL_ASPECT,
  MAX_FLICK,
  MAX_OPACITY_DROP,
  MAX_ROTATE_DEG,
  MAX_SCALE_DROP,
  MAX_VISIBLE,
  NEIGHBOR_SPACING_PCT,
  PERSPECTIVE_PX,
  RUBBER_BAND_COEF,
  TWEET_CARD_ASPECT,
  VELOCITY_STALE_MS,
  VELOCITY_WINDOW_MS,
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

interface DragState {
  active: boolean;
  pointerId: number;
  pointerType: string;
  startX: number;
  startY: number;
  startPos: number;
  moved: number;
  engaged: boolean;
  rejected: boolean;
  downIndex: number | null;
  history: { p: number; t: number }[];
}

// iOS scroll-view rubber band: asymptotic resistance that saturates instead of a linear multiplier
const rubberBand = (overshoot: number) => (RUBBER_BAND_COEF * overshoot) / (1 + RUBBER_BAND_COEF * overshoot);

const releaseVelocity = (history: { p: number; t: number }[]): number => {
  const last = history[history.length - 1];
  if (!last || performance.now() - last.t > VELOCITY_STALE_MS) return 0;
  let first = last;
  for (let i = history.length - 1; i >= 0; i--) {
    if (last.t - history[i].t > VELOCITY_WINDOW_MS) break;
    first = history[i];
  }
  const dt = (last.t - first.t) / 1000;
  return dt > 0.005 ? (last.p - first.p) / dt : 0;
};

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
  const drag = useRef<DragState>({
    active: false,
    pointerId: 0,
    pointerType: "",
    startX: 0,
    startY: 0,
    startPos: 0,
    moved: 0,
    engaged: false,
    rejected: false,
    downIndex: null,
    history: [],
  });
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
  const isBounded = n === 2 && !hasNextPage;

  const votingOpen = contestStatus === ContestStatus.VotingOpen;
  const fillVoidHeight = (natW: number, natH: number) =>
    !votingOpen && availableH > natH ? Math.min(availableH, natW * MAX_FILL_ASPECT) : natH;
  const cardH = fillVoidHeight(cardW, naturalCardH);
  const containerH = cardH;

  const mountedWindow = useMemo(() => {
    const s = new Set<number>();
    if (n === 0) return s;
    for (let d = -WINDOW_RADIUS; d <= WINDOW_RADIUS; d++) s.add((((activeIdx + d) % n) + n) % n);
    return s;
  }, [activeIdx, n]);

  const cardDelta = useCallback(
    (i: number, p: number) => {
      if (n === 0) return 0;
      if (isBounded) return i - p; // linear track — no wrap, so nothing peeks past the two ends
      let d = (((i - p) % n) + n) % n;
      if (d > n / 2) d -= n;
      return d;
    },
    [n, isBounded],
  );

  // position every card around the ring for a given fractional position (imperative; runs on the motion value)
  const layout = useCallback(
    (p: number) => {
      const stage = stageRef.current;
      if (!stage) return;
      const endBias = isBounded && n > 1 ? (2 * p) / (n - 1) - 1 : 0;
      const trackShift = ((endBias * (stageWidth - cardW)) / 2) * BOUNDED_END_SHIFT;
      for (let i = 0; i < stage.children.length; i++) {
        const el = stage.children[i] as HTMLElement;
        const delta = cardDelta(i, p);
        const abs = Math.abs(delta);
        if (abs > MAX_VISIBLE + 1) {
          if (el.style.opacity !== "0") {
            el.style.opacity = "0";
            el.style.pointerEvents = "none";
          }
          continue;
        }
        const dir = Math.max(-1, Math.min(1, delta));
        const x = delta * spacing + trackShift;
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
    [cardDelta, spacing, isBounded, n, stageWidth, cardW],
  );

  // highlight whichever card is currently closest to center — updates live while rotating, not only on settle
  const updateActive = useCallback(
    (p: number) => {
      if (n === 0) return;
      const norm = isBounded ? Math.max(0, Math.min(n - 1, Math.round(p))) : ((Math.round(p) % n) + n) % n;
      if (norm !== activeRef.current) {
        activeRef.current = norm;
        setActiveIdx(norm);
      }
    },
    [n, isBounded],
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
    (target: number, velocity?: number) => {
      const dest = isBounded ? Math.max(0, Math.min(n - 1, target)) : target;
      animate(pos, dest, {
        type: "spring",
        stiffness: 320,
        damping: 34,
        ...(velocity !== undefined ? { velocity } : {}),
        onComplete: () => {
          const norm =
            n > 0 ? (isBounded ? Math.max(0, Math.min(n - 1, Math.round(dest))) : ((Math.round(dest) % n) + n) % n) : 0;
          pos.set(norm);
          maybeLoadMore(norm);
        },
      });
    },
    [pos, n, maybeLoadMore, isBounded],
  );

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (drag.current.active) return; // one gesture at a time — a second finger must not hijack the frame of reference
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pos.jump(pos.get()); // catch a settling spring in place (also zeroes its velocity)
    const card = (e.target as HTMLElement).closest?.("[data-index]") as HTMLElement | null;
    const downIndex = card ? Number(card.dataset.index) : NaN;
    drag.current = {
      active: true,
      pointerId: e.pointerId,
      pointerType: e.pointerType,
      startX: e.clientX,
      startY: e.clientY,
      startPos: pos.get(),
      moved: 0,
      engaged: false,
      rejected: false,
      downIndex: Number.isInteger(downIndex) ? downIndex : null,
      history: [{ p: pos.get(), t: performance.now() }],
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d.active || e.pointerId !== d.pointerId || spacing === 0) return;
    const dy = e.clientY - d.startY;
    let dx = e.clientX - d.startX;
    d.moved = Math.max(d.moved, Math.abs(dx), Math.abs(dy));
    if (!d.engaged) {
      // axis lock: only claim the gesture once horizontal intent is clear, so vertical
      // page scrolls never wiggle the deck
      if (d.rejected) return;
      const slop = d.pointerType === "mouse" ? DRAG_THRESHOLD : DRAG_THRESHOLD_TOUCH;
      if (Math.abs(dx) < slop) {
        if (Math.abs(dy) >= slop) d.rejected = true;
        return;
      }
      if (Math.abs(dy) > Math.abs(dx)) {
        d.rejected = true;
        return;
      }
      d.engaged = true;
      d.startX = e.clientX; // re-baseline so engagement starts without a slop-sized jump
      dx = 0;
    }
    let next = d.startPos - dx / spacing;
    if (isBounded) {
      if (next < 0) next = -rubberBand(-next);
      else if (next > n - 1) next = n - 1 + rubberBand(next - (n - 1));
    }
    pos.set(next);
    const t = performance.now();
    d.history.push({ p: next, t });
    while (d.history.length > 2 && t - d.history[0].t > VELOCITY_WINDOW_MS + 50) d.history.shift();
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d.active || e.pointerId !== d.pointerId) return;
    d.active = false;
    if (d.engaged) {
      const v = releaseVelocity(d.history);
      const cur = pos.get();
      const base = Math.round(cur);
      let projected = Math.round(cur + v * FLICK_PROJECTION_S);
      const traveled = cur - d.startPos;
      // native pagers advance on a short-but-fast fling even when projection rounds home
      if (
        projected === base &&
        Math.abs(v) >= FLICK_MIN_VELOCITY &&
        Math.abs(traveled) >= FLICK_MIN_TRAVEL &&
        Math.sign(v) === Math.sign(traveled)
      ) {
        projected = base + Math.sign(v);
      }
      const target = Math.max(base - MAX_FLICK, Math.min(base + MAX_FLICK, projected));
      snapTo(target, v);
      return;
    }
    const slop = d.pointerType === "mouse" ? DRAG_THRESHOLD : DRAG_THRESHOLD_TOUCH;
    if (d.moved <= slop && d.downIndex !== null) {
      const cur = pos.get();
      snapTo(cur + cardDelta(d.downIndex, cur)); // tap: bring the tapped card to center
      return;
    }
    snapTo(Math.round(pos.get())); // ambiguous release (caught spring, rejected axis): settle nearest
  };

  const onPointerCancel = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d.active || e.pointerId !== d.pointerId) return;
    d.active = false;
    // the browser claimed the gesture (vertical scroll) — settle without projection so the
    // horizontal remnant of a diagonal swipe never advances a card
    snapTo(Math.round(pos.get()));
  };

  if (n === 0) return null;

  return (
    <div
      ref={wrapRef}
      className="relative w-full select-none touch-pan-y overflow-hidden [-webkit-touch-callout:none]"
      style={{ height: containerH ? `${containerH}px` : undefined }}
    >
      <div
        ref={stageRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        className="absolute inset-0"
        style={{ perspective: `${PERSPECTIVE_PX}px`, perspectiveOrigin: "50% 50%" }}
      >
        {cards.map((proposal, index) => {
          const isActive = index === activeIdx;
          const isActiveTarget = votingOpen && isActive;
          const mounted = mountedWindow.has(index);
          const rawDist = Math.abs(index - activeIdx);
          const ringDist = isBounded || n === 0 ? rawDist : Math.min(rawDist, n - rawDist);
          return (
            <div
              key={proposal.id}
              data-index={index}
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
                  boxAspect={cardW > 0 && cardH > 0 ? cardH / cardW : cardAspect}
                  imageFetchPriority={ringDist <= 1 ? "high" : "low"}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EntryCarousel;
