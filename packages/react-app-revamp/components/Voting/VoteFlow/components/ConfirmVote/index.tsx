import usePriceCurveChartStore from "@components/PriceCurve/store";
import ButtonV3, { ButtonSize, ButtonType } from "@components/UI/ButtonV3";
import EntryPreviewHeader, { EntryPreviewHeaderProps } from "@components/Voting/components/EntryPreviewHeader";
import { useVotingStore } from "@components/Voting/store";
import useDisplayPrice from "@hooks/useCurrency/useDisplayPrice";
import { useVotesFromInput } from "@hooks/useVotesFromInput";
import { FC, memo } from "react";
import AmountSummary from "./components/AmountSummary";

interface ConfirmVoteProps {
  entryPreview?: EntryPreviewHeaderProps;
  chainNativeCurrencySymbol: string;
  costToVote: string;
  isVotingClosed: boolean;
  isVoteLoading: boolean;
  onConfirm: () => void;
  onGoBack: () => void;
}

const ConfirmVote: FC<ConfirmVoteProps> = ({
  entryPreview,
  chainNativeCurrencySymbol,
  costToVote,
  isVotingClosed,
  isVoteLoading,
  onConfirm,
  onGoBack,
}) => {
  const spendAmount = useVotingStore(state => state.inputValue);
  const showPriceUpdateWarning = usePriceCurveChartStore(state => state.showPriceUpdateWarning);
  const totalVotes = useVotesFromInput({ inputValue: spendAmount, costToVote });
  const { displayValue: pricePerVoteDisplay, displaySymbol: pricePerVoteSymbol } = useDisplayPrice(
    costToVote,
    chainNativeCurrencySymbol,
    undefined,
    undefined,
    { ceilingPrecision: true },
  );
  const formattedPricePerVote =
    pricePerVoteSymbol === "$" ? `$${pricePerVoteDisplay}` : `${pricePerVoteDisplay} ${pricePerVoteSymbol}`;
  const isBelowMinimum = totalVotes === 0;
  const isConfirmDisabled = isVoteLoading || isBelowMinimum || isVotingClosed;

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex flex-col gap-6 flex-1 min-h-0">
        <p className="text-[24px] font-bold text-neutral-11">confirm your vote</p>
        {entryPreview && <EntryPreviewHeader {...entryPreview} />}
        <AmountSummary spendAmount={spendAmount} symbol={chainNativeCurrencySymbol} costToVote={costToVote} />
        <div className="flex flex-col gap-2">
          {showPriceUpdateWarning && (
            <p className="text-[12px] text-secondary-11 animate-pulse text-center">
              wait for price update or tx may fail
            </p>
          )}
          <ButtonV3
            id="vote_confirm_button"
            type={ButtonType.DEFAULT}
            isDisabled={isConfirmDisabled}
            colorClass="px-[20px] text-[24px] font-bold bg-gradient-purple rounded-[40px] w-full"
            size={ButtonSize.FULL}
            onClick={onConfirm}
          >
            confirm
          </ButtonV3>
          {isBelowMinimum && (
            <p className="text-[14px] font-bold text-negative-11 px-6">
              must be at least {formattedPricePerVote} to buy a vote
            </p>
          )}
          {isVotingClosed && (
            <p className="text-[14px] font-bold text-negative-11 px-6">voting is closed for this contest</p>
          )}
        </div>
      </div>
      <div className="pt-6 shrink-0">
        <button className="flex items-center gap-[5px] cursor-pointer group" onClick={onGoBack}>
          <div className="flex items-center transition-transform duration-200 group-hover:-translate-x-1">
            <img src="/create-flow/back.svg" alt="back" width={15} height={15} />
          </div>
          <p className="text-[16px] leading-none">back</p>
        </button>
      </div>
    </div>
  );
};

export default memo(ConfirmVote);
