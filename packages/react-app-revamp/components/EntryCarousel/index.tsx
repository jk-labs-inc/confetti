import { Proposal } from "@components/_pages/ProposalContent";
import { ContestStatus } from "@hooks/useContestStatus/store";
import { EntryPreview } from "@hooks/useDeployContest/slices/contestMetadataSlice";
import useIsomorphicLayoutEffect from "@hooks/useIsomorphicLayoutEffect";
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
  FLICK_MIN_TRAVEL_PX,
  FLICK_MIN_VELOCITY_PX_S,
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
  downPos: number | null;
  history: { p: number; t: number }[];
}

interface Anchor {
  cards: Proposal[];
  origin: number;
}

const mod = (value: number, size: number) => ((value % size) + size) % size;

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

const reanchor = (previous: Anchor, cards: Proposal[], center: number): Anchor => {
  const previousN = previous.cards.length;
  if (previousN === 0 || cards.length === 0) return { cards, origin: center };
  const previousIndex = mod(center - previous.origin, previousN);
  const nextIndex = cards.findIndex(card => card.id === previous.cards[previousIndex].id);
  return { cards, origin: center - (nextIndex >= 0 ? nextIndex : Math.min(previousIndex, cards.length - 1)) };
};

const EntryCarousel: FC<EntryCarouselProps> = ({
  proposals,
  enabledPreview,
  contestStatus,
  hasNextPage,
  isLoadingMore,
  onLoadMore,
}) => {
  const [wrap, setWrap] = useState<HTMLDivElement | null>(null);
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
    downPos: null,
    history: [],
  });
  const activeRef = useRef(0);
  const targetRef = useRef<number | null>(null);
  const [stageWidth, setStageWidth] = useState(0);
  const [activePos, setActivePos] = useState(0);
  const [availableH, setAvailableH] = useState(0);
  const [anchor, setAnchor] = useState<Anchor>({ cards: [], origin: 0 });

  const activeEntry = anchor.cards.length > 0 ? mod(activePos - anchor.origin, anchor.cards.length) : 0;

  const { cards, n, pendingTargetIndex, maybeLoadMore } = useEntryFeed({
    proposals,
    activeIndex: activeEntry,
    hasNextPage,
    isLoadingMore,
    onLoadMore,
  });

  if (anchor.cards !== cards) setAnchor(reanchor(anchor, cards, activePos));

  const { origin } = anchor;
  const isBounded = n === 1;
  const canNavigate = n > 1;

  const cardW = Math.max(0, stageWidth - 2 * PAGE_GUTTER_PX);
  const spacing = cardW * (1 - MAX_SCALE_DROP / 2) + PAGE_GUTTER_PX - NEIGHBOR_PEEK_PX;

  const fillH = availableH - STICKER_ROOM_PX - GLOW_ROOM_PX;
  const cardH = Math.min(cardW * CARD_MAX_ASPECT, Math.max(cardW * CARD_MIN_ASPECT, fillH > 0 ? fillH : cardW));

  const slotPositions = useMemo(() => {
    if (n === 0) return [];
    if (isBounded) return [origin];
    return Array.from({ length: 2 * WINDOW_RADIUS + 1 }, (_, i) => activePos - WINDOW_RADIUS + i);
  }, [n, isBounded, origin, activePos]);

  const layout = useCallback(
    (p: number) => {
      const stage = stageRef.current;
      if (!stage) return;
      for (let i = 0; i < stage.children.length; i++) {
        const el = stage.children[i] as HTMLElement;
        const delta = Number(el.dataset.pos) - p;
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
    [spacing],
  );

  // highlight whichever card is currently closest to center — updates live while rotating, not only on settle
  const updateActive = useCallback((p: number) => {
    const next = Math.round(p);
    if (next !== activeRef.current) {
      activeRef.current = next;
      setActivePos(next);
    }
  }, []);

  useEffect(() => {
    const handler = (p: number) => {
      layout(p);
      updateActive(p);
    };
    handler(pos.get());
    const unsub = pos.on("change", handler);
    return () => unsub();
  }, [layout, updateActive, pos]);

  useIsomorphicLayoutEffect(() => layout(pos.get()));

  useEffect(() => {
    if (!wrap) return;
    const ro = new ResizeObserver(() => setStageWidth(wrap.clientWidth));
    ro.observe(wrap);
    setStageWidth(wrap.clientWidth);
    return () => ro.disconnect();
  }, [wrap]);

  useEffect(() => {
    if (!wrap) return;
    const viewportH = window.innerHeight;
    let restingNavReserve = Infinity;
    const measure = () => {
      const slot = document.getElementById(MOBILE_NAV_SLOT_ID);
      const footer = document.getElementById(ENTRY_CAROUSEL_FOOTER_ID);
      const navReserve = slot ? window.innerHeight - slot.getBoundingClientRect().top : 0;
      if (slot && slot.offsetHeight > 0) restingNavReserve = Math.min(restingNavReserve, navReserve);
      const floor = viewportH - Math.min(restingNavReserve, navReserve);
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
    return () => ro.disconnect();
  }, [wrap, stageWidth, contestStatus]);

  const snapTo = useCallback(
    (target: number, velocity?: number) => {
      const dest = isBounded ? origin : target;
      targetRef.current = dest;
      animate(pos, dest, {
        type: "spring",
        stiffness: 320,
        damping: 34,
        ...(velocity !== undefined ? { velocity } : {}),
        onComplete: () => {
          targetRef.current = null;
        },
      });
    },
    [pos, isBounded, origin],
  );

  useEffect(() => {
    if (!isBounded || drag.current.active || pos.get() === origin) return;
    snapTo(origin);
  }, [isBounded, origin, pos, snapTo]);

  useEffect(() => {
    maybeLoadMore(activeEntry);
  }, [activeEntry, maybeLoadMore]);

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
    if (n === 0 || pendingTargetIndex === jumpTargetRef.current || pendingTargetIndex === activeEntry) return;
    jumpTargetRef.current = pendingTargetIndex;
    let delta = mod(pendingTargetIndex - activeEntry, n);
    if (delta > n / 2) delta -= n;
    snapTo(activePos + delta);
  }, [pendingTargetIndex, activeEntry, activePos, n, snapTo]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (drag.current.active) return; // one gesture at a time — a second finger must not hijack the frame of reference
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pos.jump(pos.get()); // catch a settling spring in place (also zeroes its velocity)
    targetRef.current = null;
    const card = (e.target as HTMLElement).closest?.("[data-pos]") as HTMLElement | null;
    const downPos = card ? Number(card.dataset.pos) : NaN;
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
      downPos: Number.isInteger(downPos) ? downPos : null,
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
      const overshoot = next - origin;
      next = origin + Math.sign(overshoot) * rubberBand(Math.abs(overshoot));
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
        Math.abs(v * spacing) >= FLICK_MIN_VELOCITY_PX_S &&
        Math.abs(traveled * spacing) >= FLICK_MIN_TRAVEL_PX &&
        Math.sign(v) === Math.sign(traveled)
      ) {
        projected = base + Math.sign(v);
      }
      const target = Math.max(base - MAX_FLICK, Math.min(base + MAX_FLICK, projected));
      snapTo(target, v);
      return;
    }
    const slop = d.pointerType === "mouse" ? DRAG_THRESHOLD : DRAG_THRESHOLD_TOUCH;
    if (d.moved <= slop && d.downPos !== null) {
      snapTo(d.downPos); // tap: bring the tapped card to center
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
      ref={setWrap}
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
        {slotPositions.map(position => (
          <div
            key={position}
            data-pos={position}
            className="absolute left-1/2 top-1/2 will-change-transform"
            style={{
              width: cardW ? `${cardW}px` : `calc(100% - ${2 * PAGE_GUTTER_PX}px)`,
              height: cardH ? `${cardH}px` : undefined,
            }}
          >
            <EntryCard
              proposal={cards[mod(position - origin, n)]}
              enabledPreview={enabledPreview}
              contestStatus={contestStatus}
              centered={isBounded || position === activePos}
              imageFetchPriority={Math.abs(position - activePos) <= 1 ? "high" : "low"}
              onPrevious={canNavigate ? showPrevious : undefined}
              onNext={canNavigate ? showNext : undefined}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default EntryCarousel;
