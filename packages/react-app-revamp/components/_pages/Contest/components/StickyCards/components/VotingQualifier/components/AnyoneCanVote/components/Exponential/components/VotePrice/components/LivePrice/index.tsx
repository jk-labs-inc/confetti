import AnimatedBlinkText from "@components/UI/AnimatedBlinkText";
import { useContestStore } from "@hooks/useContest/store";
import useContestConfigStore from "@hooks/useContestConfig/store";
import useDisplayPrice from "@hooks/useCurrency/useDisplayPrice";
import useCurrentPricePerVote from "@hooks/useCurrentPricePerVote";
import Skeleton from "react-loading-skeleton";
import { useMediaQuery } from "react-responsive";
import { useShallow } from "zustand/shallow";

const VotingQualifierAnyoneCanVoteExponentialLivePrice = () => {
  const votingClose = useContestStore(useShallow(state => state.votesClose));
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const { contestConfig } = useContestConfigStore(useShallow(state => state));
  const { currentPricePerVote, isError } = useCurrentPricePerVote({
    address: contestConfig.address,
    abi: contestConfig.abi,
    chainId: contestConfig.chainId,
    votingClose,
  });

  const { displayValue, displaySymbol, isLoading } = useDisplayPrice(
    currentPricePerVote,
    contestConfig.chainNativeCurrencySymbol,
  );

  if (isError) {
    return <div className="text-red-500">Failed to load price</div>;
  }

  if (isLoading) {
    return <Skeleton width={100} height={24} baseColor="#706f78" highlightColor="#FFE25B" />;
  }

  const isUsd = displaySymbol === "$";

  return (
    <p className="text-[16px] md:text-[24px] font-bold">
      <AnimatedBlinkText value={displayValue} className="text-neutral-11" blinkColor="#78FFC6" duration={0.6}>
        {isUsd ? `$${displayValue}` : displayValue}
        {!isUsd && <span className="text-[16px] md:text-[24px] text-neutral-9 uppercase"> {displaySymbol}</span>}
      </AnimatedBlinkText>{" "}
      {isMobile && <span className="text-[12px] text-neutral-11">/ vote</span>}
    </p>
  );
};

export default VotingQualifierAnyoneCanVoteExponentialLivePrice;
