import { toastError, toastLoading, toastSuccess } from "@components/UI/Toast";
import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import { useError } from "@hooks/useError";
import { FilteredToken } from "@hooks/useTokenList";
import { sendTransaction, simulateContract, writeContract } from "@wagmi/core";
import { chainHasNativeCoin } from "lib/voteCurrency";
import { erc20Abi, parseUnits, zeroAddress } from "viem";

interface UseSendTokenOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useSendToken(options?: UseSendTokenOptions) {
  const { handleError } = useError();

  const transferERC20Token = async (
    chainId: number,
    to: `0x${string}`,
    amount: bigint,
    contractAddress: `0x${string}`,
  ) => {
    try {
      const { request } = await simulateContract(getWagmiConfig(), {
        abi: erc20Abi,
        chainId,
        address: contractAddress,
        functionName: "transfer",
        args: [to, amount],
      });

      toastLoading({
        message: "sending transfer transaction...",
      });
      const hash = await writeContract(getWagmiConfig(), request);

      toastSuccess({
        message: "transfer transaction sent successfully!",
      });
      options?.onSuccess?.();
      return hash;
    } catch (error) {
      handleError(error as Error, "transfer transaction failed");
    }
  };

  const sendToken = async (token: FilteredToken, chainId: number, recipientAddress: string, amount: string) => {
    if (!recipientAddress) {
      toastError({
        message: "recipient address is required",
      });
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toastError({
        message: "please enter a valid amount",
      });
      return;
    }

    const isNativeCoin = token.address === zeroAddress;

    if (isNativeCoin && !chainHasNativeCoin(chainId)) {
      toastError({
        message: "this chain has no native coin to send, pick a token instead",
      });
      return;
    }

    try {
      if (isNativeCoin) {
        const parsedAmount = parseUnits(amount, token.decimals);

        try {
          toastLoading({
            message: "sending transfer transaction...",
          });
          const hash = await sendTransaction(getWagmiConfig(), {
            chainId,
            to: recipientAddress as `0x${string}`,
            value: parsedAmount,
          });

          toastSuccess({
            message: "transaction sent successfully!",
          });
          options?.onSuccess?.();
          return hash;
        } catch (error) {
          const err = error as Error;
          toastError({
            message: err.message || "transaction failed",
          });
          options?.onError?.(err);
          throw error;
        }
      } else {
        const parsedAmount = parseUnits(amount, token.decimals);

        return await transferERC20Token(
          chainId,
          recipientAddress as `0x${string}`,
          parsedAmount,
          token.address as `0x${string}`,
        );
      }
    } catch (e) {
      handleError(e as Error, "transaction failed");
    }
  };

  return {
    sendToken,
  };
}
