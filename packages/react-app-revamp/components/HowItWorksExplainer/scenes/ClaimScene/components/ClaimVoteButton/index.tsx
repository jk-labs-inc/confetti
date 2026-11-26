import ClaimVoteSticker from "@components/ClaimVote/ClaimVoteSticker";
import { bump, popSpring } from "@components/HowItWorksExplainer/clock";
import RealFrame from "@components/HowItWorksExplainer/RealFrame";
import {
  BUTTON_LAYOUT_WIDTH_PX,
  BUTTON_LEFT_PX,
  BUTTON_TOP_PX,
  BUTTON_WIDTH_PX,
  CLAIM_BEATS,
} from "@components/HowItWorksExplainer/scenes/ClaimScene/beats";
import ButtonV3, { ButtonSize, ButtonType } from "@components/UI/ButtonV3";
import { CLAIM_FREE_LABEL } from "@components/XClaim/copy";
import { motion, useTransform, type MotionValue } from "motion/react";
import { FC } from "react";

interface ClaimVoteButtonProps {
  time: MotionValue<number>;
}

const FRAME_POSITION = { left: BUTTON_LEFT_PX, top: BUTTON_TOP_PX };
const PRESS_DEPTH = -0.05;
const STICKER_TILT_DEG = 8;
const STICKER_LAUNCH_POP = 0.18;

const ClaimVoteButton: FC<ClaimVoteButtonProps> = ({ time }) => {
  const intro = useTransform(time, t => popSpring(t, CLAIM_BEATS.buttonIntroAt));
  const opacity = useTransform(intro, value => Math.min(1, value * 1.5));
  const scale = useTransform(() => (0.9 + 0.1 * intro.get()) * bump(time.get(), CLAIM_BEATS.pressAt, PRESS_DEPTH));
  const stickerScale = useTransform(
    time,
    t => popSpring(t, CLAIM_BEATS.stickerAt) * bump(t, CLAIM_BEATS.launchAt, STICKER_LAUNCH_POP),
  );

  return (
    <RealFrame layoutWidthPx={BUTTON_LAYOUT_WIDTH_PX} stageWidthPx={BUTTON_WIDTH_PX} style={FRAME_POSITION}>
      <motion.div className="relative" style={{ opacity, scale }}>
        <ButtonV3
          type={ButtonType.DEFAULT}
          colorClass="px-[20px] text-[24px] font-bold bg-gradient-purple rounded-[40px] w-full"
          size={ButtonSize.FULL}
        >
          back this entry
        </ButtonV3>
        <motion.div className="absolute -top-3 -right-1.5" style={{ scale: stickerScale, rotate: STICKER_TILT_DEG }}>
          <ClaimVoteSticker label={CLAIM_FREE_LABEL} className="block px-2.5 py-0.5 text-[14px]" />
        </motion.div>
      </motion.div>
    </RealFrame>
  );
};

export default ClaimVoteButton;
