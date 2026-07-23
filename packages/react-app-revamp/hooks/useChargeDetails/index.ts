import { useDeployContestStore } from "@hooks/useDeployContest/store";
import { useQuery } from "@tanstack/react-query";
import { PERCENTAGE_TO_REWARDS_DEFAULT } from "constants/monetization";
import { fetchChargeDetails } from "lib/monetization";
import { useEffect } from "react";
import { useShallow } from "zustand/shallow";

const useChargeDetails = (chainName: string) => {
  const { setCharge, setPrevChainRefInCharge, prevChainRefInCharge, priceCurve, charge } = useDeployContestStore(
    useShallow(state => ({
      setCharge: state.setCharge,
      setPrevChainRefInCharge: state.setPrevChainRefInCharge,
      prevChainRefInCharge: state.prevChainRefInCharge,
      priceCurve: state.priceCurve,
      charge: state.charge,
    })),
  );
  const {
    data: chargeDetails,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["chargeDetails", chainName],
    queryFn: () => fetchChargeDetails(chainName),
    enabled: !!chainName,
  });

  useEffect(() => {
    if (!chargeDetails || !chainName) return;

    if (prevChainRefInCharge === chainName) return;

    if (chargeDetails.isError) {
      setCharge({
        percentageToRewards: PERCENTAGE_TO_REWARDS_DEFAULT,
        creatorSplitEnabled: charge.creatorSplitEnabled,
        costToVote: 0,
        costToVoteEndPrice: 0,
        error: true,
      });
      // don't record the chain on failure — a later successful refetch must still be able to write
      return;
    }

    setCharge({
      percentageToRewards: PERCENTAGE_TO_REWARDS_DEFAULT,
      creatorSplitEnabled: charge.creatorSplitEnabled,
      costToVote: chargeDetails.costToVote,
      costToVoteEndPrice: chargeDetails.costToVote * priceCurve.multipler,
      error: false,
    });
    setPrevChainRefInCharge(chainName);
  }, [chargeDetails, chainName, prevChainRefInCharge, setCharge, setPrevChainRefInCharge]);

  return {
    isLoading,
    // fetchChargeDetails never rejects — failures come back as data with isError set
    isError: isError || Boolean(chargeDetails?.isError),
    refetch,
    data: chargeDetails,
  };
};

export default useChargeDetails;
