import AddFundsModal from "@components/AddFunds/components/Modal";
import ButtonV3, { ButtonSize } from "@components/UI/ButtonV3";
import { formatNumberAbbreviated } from "@helpers/formatNumber";
import { useContestStore } from "@hooks/useContest/store";
import useContestConfigStore from "@hooks/useContestConfig/store";
import useDisplayPrice from "@hooks/useCurrency/useDisplayPrice";
import useCurrentPricePerVote from "@hooks/useCurrentPricePerVote";
import { useCurrentUserVotes } from "@hooks/useCurrentUserVotes";
import { useVoteBalance } from "@hooks/useVoteBalance";
import { FC, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { useShallow } from "zustand/shallow";

const BalanceOrSkeleton = ({
  isUserBalanceLoading,
  userBalance,
  nativeCurrencySymbol,
}: {
  isUserBalanceLoading: boolean;
  userBalance: string;
  nativeCurrencySymbol?: string;
}) => {
  const { displayValue, displaySymbol } = useDisplayPrice(
    userBalance,
    nativeCurrencySymbol ?? "",
  );

  return isUserBalanceLoading ? (
    <span className="flex items-center gap-1 text-neutral-9">
      <Skeleton
        width={100}
        height={16}
        baseColor="#242424"
        highlightColor="#78FFC6"
        duration={1}
        style={{ lineHeight: "normal", fontSize: "inherit", verticalAlign: "middle" }}
      />
      =
    </span>
  ) : (
    <span className="text-neutral-9">
      {displaySymbol === "$" ? `$${displayValue}` : `${displayValue} ${displaySymbol}`} =
    </span>
  );
};

interface VotingQualifierAnyoneCanVoteBalanceProps {
  userAddress: `0x${string}`;
}

const VotingQualifierAnyoneCanVoteBalance: FC<VotingQualifierAnyoneCanVoteBalanceProps> = ({ userAddress }) => {
  const { contestConfig } = useContestConfigStore(useShallow(state => state));
  const votingClose = useContestStore(useShallow(state => state.votesClose));
  const {
    currentPricePerVote,
    isLoading: isLoadingCurrentPricePerVote,
    isError: isErrorCurrentPricePerVote,
  } = useCurrentPricePerVote({
    address: contestConfig.address,
    abi: contestConfig.abi,
    chainId: contestConfig.chainId,
    votingClose,
  });
  const {
    spendableBalance,
    insufficientBalance,
    isLoading: isLoadingSpendableBalance,
    isError: isErrorSpendableBalance,
  } = useVoteBalance({
    chainId: contestConfig.chainId,
    costToVote: currentPricePerVote,
  });
  const currentUserAvailableVotesAmount = useCurrentUserVotes({
    spendableBalance: spendableBalance,
    costToVote: currentPricePerVote,
  });
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);

  // add error handling for native balance
  if (isErrorCurrentPricePerVote || isErrorSpendableBalance) {
    return <p className="text-[16px] md:text-[24px] text-secondary-11 font-bold">error</p>;
  }

  if (insufficientBalance) {
    return (
      <>
        <AddFundsModal
          chain={contestConfig.chainName}
          asset={contestConfig.chainNativeCurrencySymbol}
          isOpen={isAddFundsOpen}
          onClose={() => setIsAddFundsOpen(false)}
        />
        <ButtonV3
          size={ButtonSize.DEFAULT_LONG}
          colorClass="bg-true-black border border-neutral-11 rounded-[40px] hover:bg-neutral-11 hover:text-true-black transition-all duration-300"
          textColorClass="text-neutral-11"
          onClick={() => setIsAddFundsOpen(true)}
        >
          add funds
        </ButtonV3>
      </>
    );
  }

  return (
    <p className="text-[16px] md:text-[24px] font-bold flex items-center">
      <BalanceOrSkeleton
        isUserBalanceLoading={isLoadingSpendableBalance}
        userBalance={spendableBalance}
        nativeCurrencySymbol={contestConfig.chainNativeCurrencySymbol}
      />
      <span className="text-neutral-11 ml-1">
        {formatNumberAbbreviated(currentUserAvailableVotesAmount)} vote
        {currentUserAvailableVotesAmount === 1 ? "" : "s"}
      </span>
    </p>
  );
};

export default VotingQualifierAnyoneCanVoteBalance;
