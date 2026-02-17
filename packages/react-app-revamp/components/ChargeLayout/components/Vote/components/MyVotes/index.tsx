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
}

const MyVotes: FC<MyVotesProps> = ({ balance, symbol, insufficientBalance, isConnected, onAddFunds }) => {
  const { displayValue, displaySymbol, isLoading } = useDisplayPrice(balance, symbol);

  return (
    <div
      className={`flex justify-between pl-6 pr-4 items-center text-[16px] ${
        insufficientBalance ? "text-negative-11" : "text-neutral-11"
      } transition-colors duration-300`}
    >
      <p className="text-neutral-9 font-bold normal-case">
        balance:{" "}
        {!isConnected
          ? "N/A"
          : isLoading
            ? <Skeleton width={80} height={16} baseColor="#706f78" highlightColor="#FFE25B" inline />
            : displaySymbol === "$"
              ? `$${displayValue}`
              : `${displayValue} ${displaySymbol}`}
      </p>

      {!insufficientBalance && (
        <motion.button
          onClick={onAddFunds}
          className="w-24 h-6 flex items-center justify-center bg-positive-15 border border-positive-16 rounded-[40px] text-positive-11 font-bold"
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
