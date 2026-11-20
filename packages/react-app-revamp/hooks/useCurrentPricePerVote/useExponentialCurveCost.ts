import usePriceCurveUpdateInterval from "@hooks/usePriceCurveUpdateInterval";
import { chainVoteCurrency, toPriceUnits } from "lib/voteCurrency";
import { useEffect, useRef } from "react";
import { Abi, formatEther, parseEther } from "viem";
import { useReadContract } from "wagmi";

interface UseExponentialCurveCostProps {
  address: string;
  abi: Abi;
  chainId: number;
  votingClose: Date;
  enabled?: boolean;
}

interface UseExponentialCurveCostReturn {
  costToVote: string;
  costToVoteRaw: bigint;
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  isRefetchError: boolean;
  refetch: () => void;
}

export const useExponentialCurveCost = ({
  address,
  abi,
  chainId,
  votingClose,
  enabled = true,
}: UseExponentialCurveCostProps): UseExponentialCurveCostReturn => {
  const {
    priceCurveUpdateInterval,
    isLoading: isIntervalLoading,
    isError: isIntervalError,
  } = usePriceCurveUpdateInterval({
    address,
    abi,
    chainId,
    enabled,
  });

  const {
    data: currentPricePerVote,
    isLoading: isPriceLoading,
    isRefetching,
    isError: isPriceError,
    isRefetchError,
    refetch,
  } = useReadContract({
    address: address as `0x${string}`,
    abi,
    functionName: "currentPricePerVote",
    chainId,
    query: {
      enabled: !!address && !!chainId && !!abi && enabled && !isIntervalLoading,
      staleTime: 0,
      select: data => formatEther(toPriceUnits(chainVoteCurrency(chainId), data as bigint)),
      //TODO: think if we need this actually
      refetchOnWindowFocus: true,
    },
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const votingCloseTime = votingClose.getTime();

  useEffect(() => {
    // Don't set up timer if we don't have the required data
    if (!priceCurveUpdateInterval || isIntervalLoading || !votingCloseTime) {
      return;
    }

    const scheduleRefetch = () => {
      const now = Date.now();

      if (!votingCloseTime) {
        return;
      }

      const votingTimeLeftMs = Math.max(0, votingCloseTime - now);
      const votingTimeLeftSec = Math.floor(votingTimeLeftMs / 1000);

      // If voting is over, don't schedule
      if (votingTimeLeftSec <= 0) {
        return;
      }

      // Calculate seconds remaining in current cycle
      const secondsInCycle = votingTimeLeftSec % priceCurveUpdateInterval;

      // Time to wait: cycle end + 1 second buffer to ensure blockchain has updated
      // If secondsInCycle is 0, we're at the start of a cycle, so wait the full interval + 1
      const secondsToWait = (secondsInCycle === 0 ? priceCurveUpdateInterval : secondsInCycle) + 2;
      const msUntilRefetch = secondsToWait * 1000;

      // Schedule refetch 1 second after the cycle ends
      timeoutRef.current = setTimeout(() => {
        refetch();
        scheduleRefetch();
      }, msUntilRefetch);
    };

    scheduleRefetch();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [priceCurveUpdateInterval, isIntervalLoading, refetch]);

  const isLoading = isIntervalLoading || isPriceLoading;

  const isError = isIntervalError || isPriceError;

  return {
    costToVote: currentPricePerVote ?? "0",
    costToVoteRaw: parseEther(currentPricePerVote ?? "0"),
    isLoading,
    isError,
    isRefetching,
    isRefetchError,
    refetch,
  };
};
