import VoterBubble from "@components/HowItWorksExplainer/actors/VoterBubble";
import { bump, clampedInterpolate, popSpring } from "@components/HowItWorksExplainer/clock";
import { PAY_COUNT_S, WINNER_STAGE, voterRowTop } from "@components/HowItWorksExplainer/scenes/WinnerScene/beats";
import type { PayoutBeats } from "@components/HowItWorksExplainer/scenes/WinnerScene/types";
import { formatNumberWithCommas } from "@helpers/formatNumber";
import { formatDemoDollars } from "lib/howItWorks/demo";
import { motion, useTransform, type MotionValue } from "motion/react";
import { FC } from "react";

interface WinnerVoterRowProps {
  index: number;
  beat: PayoutBeats;
  time: MotionValue<number>;
}

const LAND_BUMP = 0.15;
const TEXT_GAP_PX = 8;

const WinnerVoterRow: FC<WinnerVoterRowProps> = ({ index, beat, time }) => {
  const { voter } = beat;
  const rowIn = useTransform(time, t => popSpring(t, beat.inAt));
  const rowOpacity = useTransform(rowIn, value => Math.min(1, value * 2));
  const avatarScale = useTransform(time, t => rowIn.get() * bump(t, beat.landAt, LAND_BUMP));
  const amountLabel = useTransform(time, t => {
    const counted = clampedInterpolate(t, [beat.landAt, beat.landAt + PAY_COUNT_S], [0, 1]);
    return `+${formatDemoDollars(Math.round(voter.payout * counted))}`;
  });
  const amountOpacity = useTransform(time, t => (t >= beat.landAt ? 1 : 0));

  return (
    <motion.div
      className="absolute"
      style={{ left: WINNER_STAGE.voterLeft, top: voterRowTop(index), opacity: rowOpacity }}
    >
      <VoterBubble seed={voter.seed} sizePx={WINNER_STAGE.voterSize} style={{ left: 0, top: 0, scale: avatarScale }} />
      <div
        className="flex flex-col justify-center"
        style={{ marginLeft: WINNER_STAGE.voterSize + TEXT_GAP_PX, height: WINNER_STAGE.voterSize + 4 }}
      >
        <motion.span style={{ opacity: amountOpacity }} className="text-[14px] font-bold leading-none text-primary-10">
          {amountLabel}
        </motion.span>
        <span className="whitespace-nowrap text-[10px] leading-tight text-neutral-9">
          {voter.isYou && <span className="font-bold text-neutral-11">you · </span>}
          {formatNumberWithCommas(voter.votes)} votes
        </span>
      </div>
    </motion.div>
  );
};

export default WinnerVoterRow;
