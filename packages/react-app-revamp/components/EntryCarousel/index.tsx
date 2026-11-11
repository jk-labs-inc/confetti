import { ContestStatus } from "@hooks/useContestStatus/store";
import { EntryPreview } from "@hooks/useDeployContest/slices/contestMetadataSlice";
import { MOBILE_NAV_SLOT_ID } from "@hooks/useMobileNavSlot";
import { ProposalCore } from "@hooks/useProposal/store";
import { animate, useMotionValue } from "motion/react";
import { FC, PointerEvent as ReactPointerEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import EntryCard from "./EntryCard";
import { useEntryFeed } from "./useEntryFeed";
import {
  CARD_MAX_ASPECT,
  CARD_MIN_ASPECT,
  DRAG_THRESHOLD,
  DRAG_THRESHOLD_TOUCH,
  ENTRY_CAROUSEL_FOOTER_ID,
  FILL_BOTTOM_GAP_PX,
  FLICK_MIN_TRAVEL,
  FLICK_MIN_VELOCITY,
  FLICK_PROJECTION_S,
  GLOW_ROOM_PX,
  MAX_FLICK,
  MAX_OPACITY_DROP,
  MAX_SCALE_DROP,
  MAX_VISIBLE,
  NEIGHBOR_PEEK_PX,
  PAGE_GUTTER_PX,
  RUBBER_BAND_COEF,
  STICKER_ROOM_PX,
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
  const targetRef = useRef<number | null>(null);
  const [stageWidth, setStageWidth] = useState(0);
  const [activeIdx, setActiveIdx] = useState(0);
  const [availableH, setAvailableH] = useState(0);

  const { cards, n, pendingTargetIndex, maybeLoadMore } = useEntryFeed({
    proposals,
    activeIndex: activeIdx,
    hasNextPage,
    isLoadingMore,
    onLoadMore,
  });

  const isPair = n === 2;
  const ring = useMemo(() => (isPair ? [...cards, ...cards] : cards), [cards, isPair]);
  const ringSize = ring.length;

  const cardW = Math.max(0, stageWidth - 2 * PAGE_GUTTER_PX);
  const spacing = cardW * (1 - MAX_SCALE_DROP / 2) + PAGE_GUTTER_PX - NEIGHBOR_PEEK_PX;
  const isBounded = ringSize === 1;
  const canNavigate = n > 1;

  const fillH = availableH - STICKER_ROOM_PX - GLOW_ROOM_PX;
  const cardH = Math.min(cardW * CARD_MAX_ASPECT, Math.max(cardW * CARD_MIN_ASPECT, fillH > 0 ? fillH : cardW));

  const mountedWindow = useMemo(() => {
    const s = new Set<number>();
    if (ringSize === 0) return s;
    for (let d = -WINDOW_RADIUS; d <= WINDOW_RADIUS; d++) s.add((((activeIdx + d) % ringSize) + ringSize) % ringSize);
    return s;
  }, [activeIdx, ringSize]);

  const cardDelta = useCallback(
    (i: number, p: number) => {
      if (ringSize === 0) return 0;
      if (isBounded) return i - p;
      let d = (((i - p) % ringSize) + ringSize) % ringSize;
      if (d > ringSize / 2) d -= ringSize;
      return d;
    },
    [ringSize, isBounded],
  );

  const layout = useCallback(
    (p: number) => {
      const stage = stageRef.current;
      if (!stage) return;
      for (let i = 0; i < stage.children.length; i++) {
        const el = stage.children[i] as HTMLElement;
        const delta = cardDelta(i, p);
        const abs = Math.abs(delta);
        if (abs > MAX_VISIBLE) {
          if (el.style.opacity !== "0") {
            el.style.opacity = "0";
            el.style.pointerEvents = "none";
          }
          continue;
        }
        const near = Math.min(1, abs);
        const scale = 1 - MAX_SCALE_DROP * near;
        el.style.transform = `translate(-50%, -50%) translateX(${(delta * spacing).toFixed(1)}px) scale(${scale.toFixed(3)})`;
        el.style.opacity = (1 - MAX_OPACITY_DROP * near).toFixed(3);
        el.style.zIndex = String(1000 - Math.round(abs * 10));
        el.style.pointerEvents = "auto";
      }
    },
    [cardDelta, spacing],
  );

  // highlight whichever card is currently closest to center — updates live while rotating, not only on settle
  const updateActive = useCallback(
    (p: number) => {
      if (ringSize === 0) return;
      const norm = isBounded ? 0 : ((Math.round(p) % ringSize) + ringSize) % ringSize;
      if (norm !== activeRef.current) {
        activeRef.current = norm;
        setActiveIdx(norm);
      }
    },
    [ringSize, isBounded],
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
      const footer = document.getElementById(ENTRY_CAROUSEL_FOOTER_ID);
      const floor = slot ? slot.getBoundingClientRect().top : window.innerHeight;
      const wrapRect = wrap.getBoundingClientRect();
      const footerH = footer ? footer.getBoundingClientRect().bottom - wrapRect.bottom : 0;
      const wrapTopAtScrollTop = wrapRect.top + window.scrollY;
      setAvailableH(Math.max(0, floor - wrapTopAtScrollTop - footerH - FILL_BOTTOM_GAP_PX));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    for (const id of [MOBILE_NAV_SLOT_ID, ENTRY_CAROUSEL_FOOTER_ID]) {
      const el = document.getElementById(id);
      if (el) ro.observe(el);
    }
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [stageWidth, n, contestStatus]);

  // re-layout when sizing or the entry set changes
  useEffect(() => {
    layout(pos.get());
  }, [stageWidth, ring]);

  const ringShapeRef = useRef({ ringSize, n });
  useEffect(() => {
    const previous = ringShapeRef.current;
    ringShapeRef.current = { ringSize, n };
    if (previous.ringSize === ringSize || previous.ringSize === 0 || n === 0) return;
    const p = pos.get();
    const previousIndex = ((Math.round(p) % previous.ringSize) + previous.ringSize) % previous.ringSize;
    const entryIndex = Math.min(previousIndex % previous.n, n - 1);
    targetRef.current = null;
    pos.jump(entryIndex + p - Math.round(p));
  }, [ringSize, n, pos]);

  const snapTo = useCallback(
    (target: number, velocity?: number) => {
      const dest = isBounded ? 0 : target;
      targetRef.current = dest;
      animate(pos, dest, {
        type: "spring",
        stiffness: 320,
        damping: 34,
        ...(velocity !== undefined ? { velocity } : {}),
        onComplete: () => {
          const norm = ringSize > 0 && !isBounded ? ((Math.round(dest) % ringSize) + ringSize) % ringSize : 0;
          targetRef.current = null;
          pos.set(norm);
          maybeLoadMore(norm);
        },
      });
    },
    [pos, ringSize, maybeLoadMore, isBounded],
  );

  const step = useCallback(
    (direction: number) => snapTo((targetRef.current ?? Math.round(pos.get())) + direction),
    [pos, snapTo],
  );
  const showPrevious = useCallback(() => step(-1), [step]);
  const showNext = useCallback(() => step(1), [step]);

  const jumpTargetRef = useRef<number | null>(null);
  useEffect(() => {
    if (pendingTargetIndex === null) {
      jumpTargetRef.current = null;
      return;
    }
    if (pendingTargetIndex === jumpTargetRef.current || pendingTargetIndex === activeRef.current % n) return;
    jumpTargetRef.current = pendingTargetIndex;
    const current = pos.get();
    let nearest = cardDelta(pendingTargetIndex, current);
    for (let copy = pendingTargetIndex + n; copy < ringSize; copy += n) {
      const delta = cardDelta(copy, current);
      if (Math.abs(delta) < Math.abs(nearest)) nearest = delta;
    }
    snapTo(current + nearest);
  }, [pendingTargetIndex, snapTo, cardDelta, pos, n, ringSize]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (drag.current.active) return; // one gesture at a time — a second finger must not hijack the frame of reference
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pos.jump(pos.get()); // catch a settling spring in place (also zeroes its velocity)
    targetRef.current = null;
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
      className="relative select-none touch-pan-y overflow-hidden [-webkit-touch-callout:none]"
      style={{
        marginInline: -PAGE_GUTTER_PX,
        height: cardH ? `${STICKER_ROOM_PX + cardH + GLOW_ROOM_PX}px` : undefined,
      }}
    >
      <div
        ref={stageRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        className="absolute inset-x-0"
        style={{ top: STICKER_ROOM_PX, height: cardH ? `${cardH}px` : undefined }}
      >
        {ring.map((proposal, index) => {
          const mounted = mountedWindow.has(index);
          const rawDist = Math.abs(index - activeIdx);
          const ringDist = Math.min(rawDist, ringSize - rawDist);
          return (
            <div
              key={index < n ? proposal.id : `${proposal.id}:mirror`}
              data-index={index}
              className={`absolute left-1/2 top-1/2 ${mounted ? "will-change-transform" : ""}`}
              style={{
                width: cardW ? `${cardW}px` : `calc(100% - ${2 * PAGE_GUTTER_PX}px)`,
                height: cardH ? `${cardH}px` : undefined,
              }}
            >
              {mounted ? (
                <EntryCard
                  proposal={proposal}
                  enabledPreview={enabledPreview}
                  contestStatus={contestStatus}
                  centered={index === activeIdx}
                  imageFetchPriority={ringDist <= 1 ? "high" : "low"}
                  onPrevious={canNavigate ? showPrevious : undefined}
                  onNext={canNavigate ? showNext : undefined}
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
