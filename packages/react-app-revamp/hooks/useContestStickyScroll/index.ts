import { useMotionValueEvent, useScroll } from "motion/react";
import { useCallback, useEffect, useRef } from "react";
import { useContestStickyStore } from "../useContestStickyStore";

const STICKY_TITLE_HEIGHT = 96;
const STICKY_WITH_REWARDS_HEIGHT = 130;
const HYSTERESIS_PX = 16;
const TALL_VIEWPORT_MIN_HEIGHT_PX = 900;

interface MarkerPositions {
  compact: number;
  rewards: number;
  chart: number;
}

const POSITION_INFINITY: MarkerPositions = {
  compact: Number.POSITIVE_INFINITY,
  rewards: Number.POSITIVE_INFINITY,
  chart: Number.POSITIVE_INFINITY,
};

const measureMarker = (kind: "compact" | "rewards" | "chart"): number => {
  if (typeof document === "undefined") return Number.POSITIVE_INFINITY;
  const el = document.querySelector(`[data-sticky-marker="${kind}"]`) as HTMLElement | null;
  if (!el) return Number.POSITIVE_INFINITY;
  return el.getBoundingClientRect().top + window.scrollY;
};

const measureAll = (): MarkerPositions => ({
  compact: measureMarker("compact"),
  rewards: measureMarker("rewards"),
  chart: measureMarker("chart"),
});

export const useContestStickyScroll = () => {
  const { scrollY } = useScroll();
  const positionsRef = useRef<MarkerPositions>(POSITION_INFINITY);
  const isTallViewportRef = useRef(false);

  const evaluate = useCallback((current: number) => {
    const positions = positionsRef.current;
    const state = useContestStickyStore.getState();

    const compactOn = positions.compact;
    const compactOff = compactOn - HYSTERESIS_PX;
    if (!state.isCompact && current >= compactOn) {
      state.setIsCompact(true);
    } else if (state.isCompact && current <= compactOff) {
      state.setIsCompact(false);
    }

    if (isTallViewportRef.current) {
      if (state.isPastRewards) state.setIsPastRewards(false);
      if (state.isPastChart) state.setIsPastChart(false);
      return;
    }

    const rewardsOn = positions.rewards - STICKY_TITLE_HEIGHT;
    const rewardsOff = rewardsOn - HYSTERESIS_PX;
    if (!state.isPastRewards && current >= rewardsOn) {
      state.setIsPastRewards(true);
    } else if (state.isPastRewards && current <= rewardsOff) {
      state.setIsPastRewards(false);
    }

    const chartOn = positions.chart - STICKY_WITH_REWARDS_HEIGHT;
    const chartOff = chartOn - HYSTERESIS_PX;
    if (!state.isPastChart && current >= chartOn) {
      state.setIsPastChart(true);
    } else if (state.isPastChart && current <= chartOff) {
      state.setIsPastChart(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const remeasure = () => {
      positionsRef.current = measureAll();
      evaluate(scrollY.get());
    };

    const raf = requestAnimationFrame(remeasure);

    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(remeasure) : null;
    ro?.observe(document.body);

    window.addEventListener("resize", remeasure);

    const mq = window.matchMedia(`(min-height: ${TALL_VIEWPORT_MIN_HEIGHT_PX}px)`);
    const updateTall = () => {
      isTallViewportRef.current = mq.matches;
      evaluate(scrollY.get());
    };
    updateTall();
    mq.addEventListener("change", updateTall);

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener("resize", remeasure);
      mq.removeEventListener("change", updateTall);
    };
  }, [evaluate, scrollY]);

  useMotionValueEvent(scrollY, "change", evaluate);
};
