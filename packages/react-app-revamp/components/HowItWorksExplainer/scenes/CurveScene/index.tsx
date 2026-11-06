import { clampedInterpolate } from "@components/HowItWorksExplainer/clock";
import DemoPriceCurve, { CURVE_INSET_PX } from "@components/HowItWorksExplainer/DemoPriceCurve";
import { useClockState, useSceneClock } from "@components/HowItWorksExplainer/engine";
import { captionStopAt, curveBeats, curveMoment } from "@components/HowItWorksExplainer/scenes/CurveScene/beats";
import CurveCaption from "@components/HowItWorksExplainer/scenes/CurveScene/components/CurveCaption";
import type { SceneProps } from "@components/HowItWorksExplainer/types";
import { useTransform } from "motion/react";
import { FC, useMemo } from "react";

const CHART_HEIGHT_PX = 196;
const CAPTION_TOP_PX = CURVE_INSET_PX + CHART_HEIGHT_PX + 4;
const CAPTION_FADE_S = 0.17;

const CurveScene: FC<SceneProps> = ({ script }) => {
  const beats = useMemo(() => curveBeats(script), [script]);
  const time = useSceneClock(beats);
  const moment = useTransform(time, t => curveMoment(beats, t));
  const pointIndex = useClockState(moment, current => current.pointIndex);
  const captionStop = useClockState(moment, current => captionStopAt(beats, current));
  const captionOpacity = useTransform(moment, ({ t, activeStop, leftStop }) => {
    if (activeStop) return clampedInterpolate(t, [activeStop.arriveAt, activeStop.arriveAt + CAPTION_FADE_S], [0, 1]);
    return leftStop ? clampedInterpolate(t, [leftStop.leaveAt, leftStop.leaveAt + CAPTION_FADE_S], [1, 0]) : 0;
  });

  return (
    <>
      <DemoPriceCurve script={script} pointIndex={pointIndex} heightPx={CHART_HEIGHT_PX} />
      <CurveCaption buy={captionStop.buy} style={{ top: CAPTION_TOP_PX, opacity: captionOpacity }} />
    </>
  );
};

export default CurveScene;
