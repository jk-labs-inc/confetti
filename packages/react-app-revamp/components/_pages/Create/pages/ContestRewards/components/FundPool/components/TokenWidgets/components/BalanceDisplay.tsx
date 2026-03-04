import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { FC } from "react";

interface BalanceDisplayProps {
  balanceDisplay: string;
  balanceSymbol: string;
  balanceValue: string;
  onMax: () => void;
  onRefresh: () => void;
}

const BalanceDisplay: FC<BalanceDisplayProps> = ({
  balanceDisplay,
  balanceSymbol,
  balanceValue,
  onMax,
  onRefresh,
}) => {
  const hasBalance = !!balanceValue && parseFloat(balanceValue) > 0;

  return (
    <div className="flex gap-2 items-center group">
      <p className="text-[16px] text-neutral-14 font-bold">
        balance: {balanceDisplay} <span className="uppercase">{balanceSymbol}</span>
      </p>

      {hasBalance ? (
        <div
          className="w-12 text-center rounded-[10px] border items-center border-positive-11 hover:border-2 cursor-pointer"
          onClick={onMax}
          role="button"
          tabIndex={0}
          aria-label="Use max balance"
          onKeyDown={e => {
            if (e.key === "Enter" || e.key === " ") onMax();
          }}
        >
          <p className="text-[12px] text-positive-11 infinite-submissions uppercase">max</p>
        </div>
      ) : null}
      <ArrowPathIcon
        className="w-5 h-5 text-neutral-14 hover:text-neutral-11 transition-all cursor-pointer opacity-0 group-hover:opacity-100 duration-300"
        onClick={onRefresh}
        aria-label="Refresh balance"
      />
    </div>
  );
};

export default BalanceDisplay;
