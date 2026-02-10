import { EMPTY_MERKLE_ROOT } from "@components/_pages/Contest/Parameters/constants";
import { useContestStore } from "@hooks/useContest/store";
import useContestConfigStore from "@hooks/useContestConfig/store";
import useDisplayPrice from "@hooks/useCurrency/useDisplayPrice";
import Skeleton from "react-loading-skeleton";
import { formatEther } from "viem";
import { useReadContract } from "wagmi";
import { useShallow } from "zustand/shallow";

const ContestParametersVotingLegacy = () => {
  const charge = useContestStore(useShallow(state => state.charge));
  const { contestConfig } = useContestConfigStore(useShallow(state => state));
  const {
    data: votingMerkleRoot,
    isLoading: isLoadingVotingMerkleRoot,
    isError: isErrorVotingMerkleRoot,
    refetch: refetchVotingMerkleRoot,
  } = useReadContract({
    address: contestConfig.address,
    chainId: contestConfig.chainId,
    abi: contestConfig.abi,
    functionName: "votingMerkleRoot",
  });

  const costFormatted = formatEther(BigInt(charge.costToVote));
  const { displayValue, displaySymbol } = useDisplayPrice(costFormatted, contestConfig.chainNativeCurrencySymbol);

  if (isLoadingVotingMerkleRoot) {
    return <Skeleton width={100} height={24} baseColor="#6A6A6A" highlightColor="#BB65FF" />;
  }

  if (isErrorVotingMerkleRoot) {
    return (
      <p className="text-[16px] text-negative-11">
        ruh-roh! we couldn't fetch voting details,{" "}
        <button onClick={() => refetchVotingMerkleRoot} className="text-neutral-11 font-bold">
          try again
        </button>
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <p className="text-[24px] text-neutral-11">voting</p>
      <ul className="pl-4 text-[16px] text-neutral-9">
        <>
          <li className="list-disc">
            {votingMerkleRoot === EMPTY_MERKLE_ROOT ? "anyone can vote" : "voting was allowlisted"}
          </li>
          <li className="list-disc">
            {displaySymbol === "$" ? `$${displayValue}` : `${displayValue} ${displaySymbol}`} to vote
          </li>
        </>
      </ul>
    </div>
  );
};

export default ContestParametersVotingLegacy;
