import DemoVoteWidget from "@components/HowItWorksExplainer/DemoVoteWidget";
import { useClockState, useSceneClock, type SceneProps } from "@components/HowItWorksExplainer/engine";
import { ENTRY_CARD_SIZE_PX, entryRowLeft } from "@components/HowItWorksExplainer/realProps";
import { pushBeats, standingsAt } from "@components/HowItWorksExplainer/scenes/PushScene/beats";
import RankedCard from "@components/HowItWorksExplainer/scenes/PushScene/components/RankedCard";
import { typedPrefix } from "@components/HowItWorksExplainer/typing";
import { FC, useMemo } from "react";

const CARD_TOP_PX = 12;
const WIDGET_WIDTH_PX = 240;
const WIDGET_TOP_PX = CARD_TOP_PX + ENTRY_CARD_SIZE_PX + 6;

const slotLeft = (rank: number) => entryRowLeft(rank - 1);

const PushScene: FC<SceneProps> = ({ script }) => {
  const scenario = script.scenarios.push;
  const beats = useMemo(() => pushBeats(script), [script]);
  const time = useSceneClock(beats);
  const isPressed = useClockState(time, t => t >= beats.pressAt);
  const isReshuffled = useClockState(time, t => t >= beats.reshuffleAt);
  const typed = useClockState(time, t => typedPrefix(t, scenario.spend, beats.typeAt));
  const before = useMemo(() => standingsAt(script, beats, false), [script, beats]);
  const after = useMemo(() => standingsAt(script, beats, true), [script, beats]);
  const standings = isReshuffled ? after : before;

  return (
    <>
      {script.entries.map((entry, i) => (
        <RankedCard
          key={entry.id}
          entry={entry}
          votes={standings[i].votes}
          rank={standings[i].rank}
          time={time}
          fromLeftPx={slotLeft(before[i].rank)}
          toLeftPx={slotLeft(after[i].rank)}
          moveAt={beats.reshuffleAt}
          topPx={CARD_TOP_PX}
          isHighlighted={entry.id === scenario.entryId}
        />
      ))}
      <DemoVoteWidget
        script={script}
        scenario={scenario}
        spend={isPressed ? beats.fillAmount : typed}
        time={time}
        popAt={beats.popAt}
        widthPx={WIDGET_WIDTH_PX}
        topPx={WIDGET_TOP_PX}
      />
    </>
  );
};

export default PushScene;
