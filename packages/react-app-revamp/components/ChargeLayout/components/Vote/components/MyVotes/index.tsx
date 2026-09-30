import { VotingWidgetLayout } from "@components/Voting/types";
import useDisplayPrice from "@hooks/useCurrency/useDisplayPrice";
import { FC } from "react";
import { motion } from "motion/react";
import Skeleton from "react-loading-skeleton";

interface MyVotesProps {
  balance: string;
  symbol: string;
  insufficientBalance: boolean;
  isConnected: boolean;
  onAddFunds?: () => void;
  layout?: VotingWidgetLayout;
}

interface MyVotesLayoutStyle {
  row: string;
  addFunds: string;
  skeletonHeightPx: number;
}

const LAYOUT_STYLE: Record<VotingWidgetLayout, MyVotesLayoutStyle> = {
  [VotingWidgetLayout.regular]: {
    row: "pl-6 pr-4 text-[16px]",
    addFunds: "w-24 bg-positive-15 border-positive-16",
    skeletonHeightPx: 16,
  },
  [VotingWidgetLayout.compact]: {
    row: "px-0 text-[13px]",
    addFunds: "px-3 text-[12px] border-neutral-17 hover:bg-positive-11/10 transition-colors duration-150",
    skeletonHeightPx: 13,
  },
};

const MyVotes: FC<MyVotesProps> = ({
  balance,
  symbol,
  insufficientBalance,
  isConnected,
  onAddFunds,
  layout = VotingWidgetLayout.regular,
}) => {
  const { displayValue, displaySymbol, isLoading } = useDisplayPrice(balance, symbol);
  const layoutStyle = LAYOUT_STYLE[layout];

  return (
    <div
      className={`flex justify-between ${layoutStyle.row} items-center ${
        insufficientBalance ? "text-negative-11" : "text-neutral-11"
      } transition-colors duration-300`}
    >
      <p className="text-neutral-9 font-bold normal-case">
        balance:{" "}
        {!isConnected
          ? "N/A"
          : isLoading
            ? <Skeleton width={80} height={layoutStyle.skeletonHeightPx} baseColor="#706f78" highlightColor="#FFE25B" inline />
            : displaySymbol === "$"
              ? `$${displayValue}`
              : <><span>{displayValue}</span> <span className="uppercase">{displaySymbol}</span></>}
      </p>

      {isConnected && !insufficientBalance && (
        <motion.button
          onClick={onAddFunds}
          className={`h-6 flex items-center justify-center border rounded-[40px] text-positive-11 font-bold ${layoutStyle.addFunds}`}
          style={{ willChange: "transform" }}
          whileTap={{ scale: 0.97 }}
        >
          add funds
        </motion.button>
      )}
    </div>
  );
};

export default MyVotes;
