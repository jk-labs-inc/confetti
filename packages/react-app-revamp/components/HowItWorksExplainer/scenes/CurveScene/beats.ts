import type { SceneTiming } from "@components/HowItWorksExplainer/engine";
import type { DemoCurveBuy, DemoScript } from "lib/howItWorks/demo";

const INTRO_S = 0.4;
const HOLD_S = 1.1;
const TRAVEL_S = 1;
const END_HOLD_S = 0.8;

interface CurveStop {
  buy: DemoCurveBuy;
  pointIndex: number;
  arriveAt: number;
  leaveAt: number;
}

interface CurveBeats extends SceneTiming {
  stops: CurveStop[];
}

interface CurveMoment {
  t: number;
  pointIndex: number;
  activeStop: CurveStop | null;
  leftStop: CurveStop | null;
}

export const curveBeats = (script: DemoScript): CurveBeats => {
  const stops = script.curve.sameSpendBuys.map((buy, k) => {
    const arriveAt = INTRO_S + k * (HOLD_S + TRAVEL_S);
    return {
      buy,
      pointIndex: buy.pointIndex,
      arriveAt,
      leaveAt: arriveAt + HOLD_S,
    };
  });
  const last = stops[stops.length - 1];
  return { stops, durationS: last.leaveAt + END_HOLD_S, stillS: last.arriveAt + HOLD_S / 2 };
};

const pointIndexAt = (beats: CurveBeats, t: number, activeStop: CurveStop | null) => {
  if (activeStop) return activeStop.pointIndex;
  const next = beats.stops.find(stop => t < stop.arriveAt);
  if (!next) return beats.stops[beats.stops.length - 1].pointIndex;
  const previous = beats.stops[beats.stops.indexOf(next) - 1];
  if (!previous) return 0;
  const progress = (t - previous.leaveAt) / (next.arriveAt - previous.leaveAt);
  const eased = progress * progress * (3 - 2 * progress);
  return Math.round(previous.pointIndex + (next.pointIndex - previous.pointIndex) * eased);
};

export const curveMoment = (beats: CurveBeats, t: number): CurveMoment => {
  const activeStop = beats.stops.find(stop => t >= stop.arriveAt && t < stop.leaveAt) ?? null;
  return {
    t,
    pointIndex: pointIndexAt(beats, t, activeStop),
    activeStop,
    leftStop: beats.stops.findLast(stop => t >= stop.leaveAt) ?? null,
  };
};

export const captionStopAt = (beats: CurveBeats, moment: CurveMoment) =>
  moment.activeStop ?? moment.leftStop ?? beats.stops[0];
