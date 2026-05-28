import ContestRewardsInfo from "@components/_pages/Contest/components/RewardsInfo";
import ContestName from "@components/_pages/Contest/components/ContestName";
import { useContestStickyStore } from "@hooks/useContestStickyStore";
import { AnimatePresence, motion } from "motion/react";
import { FC } from "react";
import { useShallow } from "zustand/shallow";
import ContestTiming from "./components/ContestTiming";
import StickyPriceInfo from "./components/StickyPriceInfo";

interface DesktopHeaderProps {
  contestImageUrl: string;
  contestName: string;
  contestPrompt: string;
  canEditTitle: boolean;
  contestAuthorEthereumAddress: string;
  contestVersion: string;
}

const overlayRowMotion = {
  initial: { opacity: 0, y: -8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.15, ease: "easeOut" as const },
};

const DesktopHeader: FC<DesktopHeaderProps> = ({
  contestImageUrl,
  contestName,
  contestPrompt,
  canEditTitle,
  contestAuthorEthereumAddress,
  contestVersion,
}) => {
  const { isCompact, isPastRewards, isPastChart } = useContestStickyStore(
    useShallow(state => ({
      isCompact: state.isCompact,
      isPastRewards: state.isPastRewards,
      isPastChart: state.isPastChart,
    })),
  );

  return (
    <div
      className={`animate-fade-in sticky top-0 z-20 bg-true-black before:content-[''] before:absolute before:right-full before:top-0 before:bottom-0 before:w-24 before:bg-true-black ${
        isCompact ? "border-b border-neutral-4" : ""
      }`}
    >
      <div className="flex items-center pt-10 min-h-[96px]">
        <ContestName
          contestName={contestName}
          canEditTitle={canEditTitle}
          contestAuthorEthereumAddress={contestAuthorEthereumAddress}
          contestPrompt={contestPrompt}
          contestImageUrl={contestImageUrl}
        />
      </div>

      <div className="absolute top-full left-0 right-0 z-20 pointer-events-none before:content-[''] before:absolute before:right-full before:top-0 before:bottom-0 before:w-24 before:bg-true-black">
        <AnimatePresence initial={false}>
          {isPastRewards && (
            <motion.div
              key="rewards-row"
              {...overlayRowMotion}
              className="bg-true-black pointer-events-auto"
            >
              <div className="flex items-center justify-between pt-1 pb-1">
                <ContestRewardsInfo version={contestVersion} />
                <ContestTiming />
              </div>
            </motion.div>
          )}

          {isPastChart && (
            <motion.div
              key="price-row"
              {...overlayRowMotion}
              className="bg-true-black pointer-events-auto border-b border-neutral-4"
            >
              <div className="flex items-center pt-0.5 pb-2">
                <StickyPriceInfo />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DesktopHeader;
