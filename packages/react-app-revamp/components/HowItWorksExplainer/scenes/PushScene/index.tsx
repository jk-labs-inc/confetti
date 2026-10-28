import { settleSpring } from "@components/HowItWorksExplainer/clock";
import DemoVoteWidget from "@components/HowItWorksExplainer/DemoVoteWidget";
import { STAGE_HEIGHT_PX, STAGE_WIDTH_PX, useClockState, useSceneClock } from "@components/HowItWorksExplainer/engine";
import { ENTRY_CARD_SIZE_PX } from "@components/HowItWorksExplainer/realProps";
import { pushBeats, standingsAt } from "@components/HowItWorksExplainer/scenes/PushScene/beats";
import RankedCard from "@components/HowItWorksExplainer/scenes/PushScene/components/RankedCard";
import TapRing from "@components/HowItWorksExplainer/scenes/PushScene/components/TapRing";
import type { SceneProps } from "@components/HowItWorksExplainer/types";
import { typedPrefix } from "@components/HowItWorksExplainer/typing";
import { motion, useTransform } from "motion/react";
import { FC, useMemo } from "react";

const CARD_TOP_PX = 12;
const WIDGET_WIDTH_PX = 240;
const WIDGET_TOP_PX = CARD_TOP_PX + ENTRY_CARD_SIZE_PX + 6;
const PUSH_CHIP_POINT = { x: 238, y: 127 };
const CHIP_ZOOM = 1.45;
const ZOOM_ORIGIN = { originX: PUSH_CHIP_POINT.x / STAGE_WIDTH_PX, originY: PUSH_CHIP_POINT.y / STAGE_HEIGHT_PX };

const PushScene: FC<SceneProps> = ({ script }) => {
  const scenario = script.scenarios.push;
  const beats = useMemo(() => pushBeats(script), [script]);
  const time = useSceneClock(beats);
  const isPressed = useClockState(time, t => t >= beats.pressAt);
  const hasClimbed = useClockState(time, t => t >= beats.climbAt);
  const typed = useClockState(time, t => typedPrefix(t, scenario.spend, beats.typeAt));
  const zoom = useTransform(
    time,
    t => 1 + (CHIP_ZOOM - 1) * (settleSpring(t, beats.zoomInAt) - settleSpring(t, beats.zoomOutAt)),
  );
  const entryIndex = script.entries.findIndex(entry => entry.id === scenario.entryId);
  const standing = useMemo(
    () => standingsAt(script, beats, hasClimbed)[entryIndex],
    [script, beats, hasClimbed, entryIndex],
  );

  return (
    <motion.div className="absolute inset-0" style={{ scale: zoom, ...ZOOM_ORIGIN }}>
      <RankedCard
        entry={script.entries[entryIndex]}
        votes={standing.votes}
        rank={standing.rank}
        time={time}
        climbAt={beats.climbAt}
        topPx={CARD_TOP_PX}
      />
      <DemoVoteWidget
        script={script}
        scenario={scenario}
        spend={isPressed ? beats.fillAmount : typed}
        time={time}
        popAt={beats.popAt}
        widthPx={WIDGET_WIDTH_PX}
        topPx={WIDGET_TOP_PX}
      />
      <TapRing at={PUSH_CHIP_POINT} time={time} pressAt={beats.pressAt} />
    </motion.div>
  );
};

export default PushScene;
