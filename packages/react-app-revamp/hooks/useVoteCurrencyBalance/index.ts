import { toPriceUnits, VoteCurrency } from "lib/voteCurrency";
import { erc20Abi } from "viem";
import { useBalance, useReadContract } from "wagmi";

interface UseVoteCurrencyBalanceParams {
  voteCurrency: VoteCurrency | undefined;
  chainId: number | undefined;
  owner: `0x${string}` | undefined;
  refetchIntervalMs?: number;
}

export const useVoteCurrencyBalance = ({
  voteCurrency,
  chainId,
  owner,
  refetchIntervalMs,
}: UseVoteCurrencyBalanceParams) => {
  const isNative = voteCurrency?.kind === "native";
  const isToken = voteCurrency?.kind === "token";

  const nativeBalance = useBalance({
    address: owner,
    chainId,
    query: {
      enabled: isNative && !!owner,
      refetchInterval: refetchIntervalMs,
    },
  });

  const tokenBalance = useReadContract({
    address: isToken ? voteCurrency.address : undefined,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: owner ? [owner] : undefined,
    chainId,
    query: {
      enabled: isToken && !!owner,
      refetchInterval: refetchIntervalMs,
    },
  });

  const heldUnits = isToken ? tokenBalance.data : nativeBalance.data?.value;
  const activeRead = isToken ? tokenBalance : nativeBalance;

  return {
    balance: voteCurrency && heldUnits !== undefined ? toPriceUnits(voteCurrency, heldUnits) : undefined,
    isLoading: activeRead.isLoading,
    isError: activeRead.isError,
    refetch: activeRead.refetch,
  };
};
