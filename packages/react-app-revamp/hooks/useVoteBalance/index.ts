import { getChainFromId } from "@helpers/getChainFromId";
import { STANDARD_ANYONE_CAN_VOTE_GAS_LIMIT } from "@hooks/useUserSubmitQualification/utils";
import { useWallet } from "@hooks/useWallet";
import { formatUnits } from "viem";
import { useBalance, useGasPrice } from "wagmi";

interface Balance {
  decimals: number;
  symbol: string;
  formatted: string;
  value: bigint;
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
  const chainCurrencyDecimals = getChainFromId(chainId)?.nativeCurrency?.decimals ?? 18;

  const {
    data: balance,
    isLoading: isBalanceLoading,
    isError: isBalanceError,
    refetch: refetchBalance,
  } = useBalance({
    address: userAddress as `0x${string}`,
    chainId,
    query: {
      refetchInterval: refetchIntervalMs,
    },
  });

  const { data: gasPrice, isLoading: isGasPriceLoading, isError: isGasPriceError } = useGasPrice({ chainId });

  const isLoading = isBalanceLoading || isGasPriceLoading;
  const isError = isBalanceError || isGasPriceError;

  const rawBalance = balance?.value || 0n;
  const totalGasCost = gasPrice ? gasPrice * BigInt(STANDARD_ANYONE_CAN_VOTE_GAS_LIMIT) : 0n;
  const spendableBalanceWei = rawBalance > totalGasCost ? rawBalance - totalGasCost : 0n;
  const spendableBalance = formatUnits(spendableBalanceWei, chainCurrencyDecimals);

  const spendableBalanceNum = parseFloat(spendableBalance);

  const inputBalanceNum = parseFloat(inputValue);
  const insufficientBalance =
    !isLoading &&
    !isError &&
    (spendableBalanceNum < Number(costToVote) || (!isNaN(inputBalanceNum) && inputBalanceNum > spendableBalanceNum));

  const modifiedBalance = balance
    ? {
        ...balance,
        formatted: spendableBalance,
        value: spendableBalanceWei,
      }
    : balance;

  return {
    balance: modifiedBalance,
    spendableBalance,
    refetchBalance,
    insufficientBalance,
    isLoading,
    isError,
  };
};
