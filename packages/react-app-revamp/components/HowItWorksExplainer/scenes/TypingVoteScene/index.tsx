import DemoVoteWidget from "@components/HowItWorksExplainer/DemoVoteWidget";
import { useClockState, useSceneClock } from "@components/HowItWorksExplainer/engine";
import { typedPrefix, typingBeats } from "@components/HowItWorksExplainer/typing";
import type { DemoScenarioId, DemoScript } from "lib/howItWorks/demo";
import { FC, useMemo } from "react";

interface TypingVoteSceneProps {
  script: DemoScript;
  scenarioId: Extract<DemoScenarioId, "payout" | "late">;
}

const WIDGET_WIDTH_PX = 300;
const WIDGET_TOP_PX = 52;

const TypingVoteScene: FC<TypingVoteSceneProps> = ({ script, scenarioId }) => {
  const scenario = script.scenarios[scenarioId];
  const beats = useMemo(() => typingBeats(scenario.spend), [scenario.spend]);
  const time = useSceneClock(beats);
  const spend = useClockState(time, t => typedPrefix(t, scenario.spend, beats.typeAt));

  return (
    <DemoVoteWidget
      script={script}
      scenario={scenario}
      spend={spend}
      time={time}
      popAt={beats.popAt}
      widthPx={WIDGET_WIDTH_PX}
      topPx={WIDGET_TOP_PX}
    />
  );
};

export default TypingVoteScene;
