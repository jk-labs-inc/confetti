import { bump } from "@components/HowItWorksExplainer/clock";
import { STAGE_WIDTH_PX } from "@components/HowItWorksExplainer/engine";
import RealFrame from "@components/HowItWorksExplainer/RealFrame";
import { demoProjectionDisplay } from "@components/HowItWorksExplainer/realProps";
import RewardsProjectionBlocks from "@components/Voting/components/RewardsProjection/components/Blocks";
import VoteAmountInput from "@components/Voting/components/VoteAmountInput";
import type { VotePresets } from "@components/Voting/components/VoteAmountInput/types";
import { VotingWidgetLayout, VotingWidgetStyle } from "@components/Voting/types";
import type { DemoScript, DemoVoteScenario } from "lib/howItWorks/demo";
import { CEILING_PRECISION, demoPriceDisplay } from "lib/howItWorks/display";
import { projectDemoVote } from "lib/howItWorks/projections";
import { motion, useTransform, type MotionValue } from "motion/react";
import { FC, useRef } from "react";

interface DemoVoteWidgetProps {
  script: DemoScript;
  scenario: DemoVoteScenario;
  spend: string;
  time: MotionValue<number>;
  popAt: number;
  widthPx: number;
  topPx: number;
}

const LAYOUT_WIDTH_PX = 360;
const PAYOUT_POP = 0.1;

const noop = () => {};

const PUSH_CHIP_ONLY: VotePresets = {
  showPushToFirst: true,
  showPercentPresets: false,
  onPushToFirst: noop,
  onPreset: noop,
};

const DemoVoteWidget: FC<DemoVoteWidgetProps> = ({
  script,
  scenario,
  spend,
  time,
  popAt,
  widthPx,
  topPx,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const projections = projectDemoVote(script, scenario, spend);
  const display = demoProjectionDisplay(projections);
  const payoutScale = useTransform(time, t => bump(t, popAt, PAYOUT_POP));

  return (
    <RealFrame
      layoutWidthPx={LAYOUT_WIDTH_PX}
      stageWidthPx={widthPx}
      style={{ left: (STAGE_WIDTH_PX - widthPx) / 2, top: topPx }}
    >
      <div className="flex flex-col gap-4">
        <VoteAmountInput
          inputRef={inputRef}
          displayValue={spend}
          displaySymbol="$"
          isDisplayLoading={false}
          onDisplayChange={noop}
          pricePerVote={demoPriceDisplay(scenario.pricePerVote, CEILING_PRECISION)}
          totalVotes={projections.votes}
          presets={projections.pushToFirstFillAmount ? PUSH_CHIP_ONLY : null}
          style={VotingWidgetStyle.muted}
          layout={VotingWidgetLayout.regular}
          autoFocus={false}
          isReadOnly
        />
        <motion.div style={{ scale: payoutScale }}>
          <RewardsProjectionBlocks
            entry={projections.entryProjection}
            entryFormatted={display.entryFormatted}
            winUpToFormatted={display.winUpToFormatted}
            isLoading={false}
            layout={VotingWidgetLayout.regular}
          />
        </motion.div>
      </div>
    </RealFrame>
  );
};

export default DemoVoteWidget;
