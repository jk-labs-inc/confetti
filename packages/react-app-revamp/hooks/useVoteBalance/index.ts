import { useVoteCurrencyBalance } from "@hooks/useVoteCurrencyBalance";
import { useWallet } from "@hooks/useWallet";
import { spendableWei, voteFeeGasLimit } from "lib/voteBalance/spendable";
import { findChainVoteCurrency, PRICE_UNIT_DECIMALS } from "lib/voteCurrency";
import { formatUnits } from "viem";
import { useGasPrice } from "wagmi";

interface Balance {
  formatted: string;
}

interface UseVoteBalanceReturn {
  balance: Balance | undefined;
  spendableBalance: string;
  insufficientBalance: boolean;
  isLoading: boolean;
  isError: boolean;
  refetchBalance?: () => void;
}

interface UseVoteBalanceProps {
  chainId: number;
  costToVote: string;
  inputValue?: string;
  refetchIntervalMs?: number;
}

export const useVoteBalance = ({
  chainId,
  costToVote,
  inputValue = "",
  refetchIntervalMs,
}: UseVoteBalanceProps): UseVoteBalanceReturn => {
  const { userAddress } = useWallet();
  const voteCurrency = findChainVoteCurrency(chainId);

  const {
    balance: heldPriceUnits,
    isLoading: isBalanceLoading,
    isError: isBalanceError,
    refetch: refetchBalance,
  } = useVoteCurrencyBalance({
    voteCurrency,
    chainId,
    owner: userAddress as `0x${string}`,
    refetchIntervalMs,
  });

  const { data: gasPrice, isLoading: isGasPriceLoading, isError: isGasPriceError } = useGasPrice({ chainId });

  const isLoading = isBalanceLoading || isGasPriceLoading;
  const isError = isBalanceError || isGasPriceError;

  const spendableBalanceWei = spendableWei({
    balanceWei: heldPriceUnits || 0n,
    gasPriceWei: gasPrice ?? 0n,
    feeGasLimit: voteFeeGasLimit(voteCurrency),
  });
  const spendableBalance = formatUnits(spendableBalanceWei, PRICE_UNIT_DECIMALS);

  const spendableBalanceNum = parseFloat(spendableBalance);

  const inputBalanceNum = parseFloat(inputValue);
  const insufficientBalance =
    !isLoading &&
    !isError &&
    (spendableBalanceNum < Number(costToVote) || (!isNaN(inputBalanceNum) && inputBalanceNum > spendableBalanceNum));

  return {
    balance: heldPriceUnits !== undefined ? { formatted: spendableBalance } : undefined,
    spendableBalance,
    refetchBalance,
    insufficientBalance,
    isLoading,
    isError,
  };
};
