import useContestConfigStore from "@hooks/useContestConfig/store";
import usePriceCurveType from "@hooks/usePriceCurveType";
import { FC } from "react";
import { useShallow } from "zustand/shallow";
import VotingQualifierAnyoneCanVoteExponential from "../Exponential";

interface VotingQualifierAnyoneCanVoteCurveProps {
  votingTimeLeft: number;
}

const VotingQualifierAnyoneCanVoteCurve: FC<VotingQualifierAnyoneCanVoteCurveProps> = ({ votingTimeLeft }) => {
  const { contestConfig } = useContestConfigStore(useShallow(state => state));

  const { priceCurveType } = usePriceCurveType({
    address: contestConfig.address,
    abi: contestConfig.abi,
    chainId: contestConfig.chainId,
    version: contestConfig.version,
  });

  return <VotingQualifierAnyoneCanVoteExponential votingTimeLeft={votingTimeLeft} priceCurveType={priceCurveType} />;
};

export default VotingQualifierAnyoneCanVoteCurve;
