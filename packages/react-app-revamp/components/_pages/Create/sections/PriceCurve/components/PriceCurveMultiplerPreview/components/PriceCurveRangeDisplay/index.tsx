import { useDeployContestStore } from "@hooks/useDeployContest/store";
import { VoteCurrency } from "lib/voteCurrency";
import { FC } from "react";
import { useShallow } from "zustand/shallow";
import PriceDisplay from "./components/PriceDisplay";
import { useMediaQuery } from "react-responsive";

interface PriceCurveRangeDisplayProps {
  voteCurrency: VoteCurrency;
}

const PriceCurveRangeDisplay: FC<PriceCurveRangeDisplayProps> = ({ voteCurrency }) => {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const { costToVote, costToVoteEndPrice } = useDeployContestStore(
    useShallow(state => ({
      costToVote: state.charge.costToVote,
      costToVoteEndPrice: state.charge.costToVoteEndPrice,
    })),
  );

  return (
    // pb-6 reserves room for the secondary price line, which PriceDisplay hangs below the flow
    // (absolute top-full) so it can't push the arrow and the primary prices out of alignment
    <div className="flex items-end gap-4 md:gap-6 pb-6">
      <PriceDisplay price={costToVote.toString()} label="start" voteCurrency={voteCurrency} />

      <div className="pb-2">
        <img
          src={isMobile ? "/create-flow/arrow-mobile.svg" : "/create-flow/arrow.svg"}
          alt="arrow right"
          className="w-8 md:w-full"
        />
      </div>

      <PriceDisplay price={costToVoteEndPrice?.toString() ?? ""} label="finish" voteCurrency={voteCurrency} />
    </div>
  );
};

export default PriceCurveRangeDisplay;
