import { PriceCurveType } from "@hooks/useDeployContest/types";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import { FC } from "react";
import VotingQualifierAnyoneCanVoteExponentialEndPrice from "./components/EndPrice";
import VotingQualifierAnyoneCanVoteExponentialLivePrice from "./components/LivePrice";
import { useShallow } from "zustand/shallow";

interface VotingQualifierAnyoneCanVoteExponentialVotePriceProps {
  priceCurveType?: PriceCurveType;
}

const VotingQualifierAnyoneCanVoteExponentialVotePrice: FC<VotingQualifierAnyoneCanVoteExponentialVotePriceProps> = ({
  priceCurveType = PriceCurveType.Exponential,
}) => {
  const contestStatus = useContestStatusStore(useShallow(state => state.contestStatus));
  const isVotingOpen = contestStatus === ContestStatus.VotingOpen;

  if (!isVotingOpen) {
    return <VotingQualifierAnyoneCanVoteExponentialEndPrice priceCurveType={priceCurveType} />;
  }

  return <VotingQualifierAnyoneCanVoteExponentialLivePrice />;
};

export default VotingQualifierAnyoneCanVoteExponentialVotePrice;
