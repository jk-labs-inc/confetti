import AnimatedBlinkText from "@components/UI/AnimatedBlinkText";
import DualPriceDisplay from "@components/UI/DualPriceDisplay";
import { useContestStore } from "@hooks/useContest/store";
import useContestConfigStore from "@hooks/useContestConfig/store";
import useDisplayPrice from "@hooks/useCurrency/useDisplayPrice";
import useCurrentPricePerVote from "@hooks/useCurrentPricePerVote";
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

  const { displayValue, displaySymbol, secondaryValue, secondarySymbol } = useDisplayPrice(
    currentPricePerVote,
    contestConfig.chainNativeCurrencySymbol,
  );

  if (isError) {
    return <div className="text-red-500">Failed to load price</div>;
  }

  return (
    <p className="text-[16px] md:text-[24px] font-bold">
      <AnimatedBlinkText value={displayValue} className="text-neutral-11" blinkColor="#78FFC6" duration={0.6}>
        <DualPriceDisplay
          displayValue={displayValue}
          displaySymbol={displaySymbol}
          secondaryValue={secondaryValue}
          secondarySymbol={secondarySymbol}
          secondaryClassName="text-[12px] text-neutral-9"
        />
      </AnimatedBlinkText>{" "}
      {isMobile && <span className="text-[12px] text-neutral-11">/ vote</span>}
    </p>
  );
};

export default VotingQualifierAnyoneCanVoteExponentialLivePrice;
