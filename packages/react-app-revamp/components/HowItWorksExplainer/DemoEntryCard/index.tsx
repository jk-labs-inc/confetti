import ProposalLayoutGallery from "@components/_pages/ProposalContent/components/ProposalLayout/Gallery";
import WinnerRing from "@components/_pages/ProposalContent/components/WinnerCelebration/WinnerRing";
import RealFrame from "@components/HowItWorksExplainer/RealFrame";
import { DEMO_CARD_PROPS, ENTRY_CARD_LAYOUT_WIDTH_PX, demoProposal } from "@components/HowItWorksExplainer/realProps";
import { motion, type MotionStyle } from "motion/react";
import { FC, ReactNode } from "react";
import type { DemoEntry } from "lib/howItWorks/types";

interface DemoEntryCardProps {
  entry: DemoEntry;
  votes: number;
  rank: number;
  sizePx: number;
  highlightColor?: string;
  isCrowned?: boolean;
  style: MotionStyle;
  children?: ReactNode;
}

const FRAME_POSITION = { left: 0, top: 0 };

const DemoEntryCard: FC<DemoEntryCardProps> = ({
  entry,
  votes,
  rank,
  sizePx,
  highlightColor,
  isCrowned,
  style,
  children,
}) => (
  <motion.div className="absolute" style={{ width: sizePx, height: sizePx, ...style }}>
    <RealFrame
      layoutWidthPx={ENTRY_CARD_LAYOUT_WIDTH_PX}
      stageWidthPx={sizePx}
      stageHeightPx={sizePx}
      style={FRAME_POSITION}
    >
      <div className="relative">
        {isCrowned && <WinnerRing />}
        <div className="relative z-[1]">
          <ProposalLayoutGallery
            {...DEMO_CARD_PROPS}
            proposal={demoProposal(entry, { votes, rank })}
            highlightColor={highlightColor}
          />
        </div>
      </div>
    </RealFrame>
    {children}
  </motion.div>
);

export default DemoEntryCard;
