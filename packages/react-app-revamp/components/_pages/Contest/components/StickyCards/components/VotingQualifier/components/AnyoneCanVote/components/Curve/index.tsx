import useContestConfigStore from "@hooks/useContestConfig/store";
import usePriceCurveType from "@hooks/usePriceCurveType";
import { compareVersions } from "compare-versions";
import { LOG_CURVE_VERSION } from "constants/versions";
import { FC } from "react";
import { useShallow } from "zustand/shallow";
import VotingQualifierAnyoneCanVoteExponential from "../Exponential";

interface VotingQualifierAnyoneCanVoteCurveProps {
  votingTimeLeft: number;
}

const VotingQualifierAnyoneCanVoteCurve: FC<VotingQualifierAnyoneCanVoteCurveProps> = ({ votingTimeLeft }) => {
  const { contestConfig } = useContestConfigStore(useShallow(state => state));
  const isLogCurveVersion =
    !!contestConfig.version && compareVersions(contestConfig.version, LOG_CURVE_VERSION) >= 0;

  const { priceCurveType } = usePriceCurveType({
    address: contestConfig.address,
    abi: contestConfig.abi,
    chainId: contestConfig.chainId,
    enabled: isLogCurveVersion,
  });

  return <VotingQualifierAnyoneCanVoteExponential votingTimeLeft={votingTimeLeft} priceCurveType={priceCurveType} />;
};

export default VotingQualifierAnyoneCanVoteCurve;
