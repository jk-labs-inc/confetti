import { scheduleBodyLockCleanup } from "@components/UI/Drawer";
import { toastError } from "@components/UI/Toast";
import { buildFunkitCheckoutConfig, getFunkitChain } from "@config/funkit";
import { useFunkitCheckout } from "@funkit/connect";
import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import { useWallet } from "@hooks/useWallet";
import { useQueryClient } from "@tanstack/react-query";
import { getAccount, switchChain } from "@wagmi/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { useBalance } from "wagmi";

export const DEPOSIT_ARRIVAL_POLL_INTERVAL_MS = 5_000;
const DEPOSIT_ARRIVAL_MAX_WAIT_MS = 30 * 60_000;

interface UseAddFundsParams {
  chain: string;
}

interface DepositWatch {
  startBalance: bigint | null;
  expiresAt: number;
}

export const useAddFunds = ({ chain }: UseAddFundsParams) => {
  const { isConnected, userAddress } = useWallet();
  const queryClient = useQueryClient();
  const funkitChain = getFunkitChain(chain);
  const [depositWatch, setDepositWatch] = useState<DepositWatch | null>(null);
  const hasConfirmedDepositRef = useRef(false);

  const { data: balance } = useBalance({
    address: userAddress as `0x${string}` | undefined,
    chainId: funkitChain?.id,
    query: {
      enabled: !!funkitChain && !!userAddress,
      refetchInterval: depositWatch ? DEPOSIT_ARRIVAL_POLL_INTERVAL_MS : undefined,
    },
  });

  const balanceValueRef = useRef<bigint | undefined>(undefined);
  useEffect(() => {
    balanceValueRef.current = balance?.value;
  });

  const startDepositWatch = useCallback(() => {
    hasConfirmedDepositRef.current = true;
    setDepositWatch(
      current =>
        current ?? {
          startBalance: balanceValueRef.current ?? null,
          expiresAt: Date.now() + DEPOSIT_ARRIVAL_MAX_WAIT_MS,
        },
    );
  }, []);

  const { beginCheckout } = useFunkitCheckout({
    onConfirmation: () => startDepositWatch(),
    onSuccess: result => {
      if (result.type === "success") startDepositWatch();
    },
    onClose: ({ isNewDeposit, isSoftHidden }) => {
      scheduleBodyLockCleanup();
      if (isNewDeposit || isSoftHidden) return;
      if (!hasConfirmedDepositRef.current || !funkitChain) return;
      const wagmiConfig = getWagmiConfig();
      const { chainId } = getAccount(wagmiConfig);
      if (chainId && chainId !== funkitChain.id) {
        switchChain(wagmiConfig, { chainId: funkitChain.id }).catch(() => {});
      }
    },
    onError: result => toastError({ message: result.message }),
  });

  useEffect(() => {
    if (!depositWatch || balance === undefined) return;
    if (depositWatch.startBalance === null) {
      setDepositWatch({ ...depositWatch, startBalance: balance.value });
      return;
    }
    if (balance.value <= depositWatch.startBalance) return;
    setDepositWatch(null);
    queryClient.invalidateQueries({ queryKey: ["balance"] });
  }, [depositWatch, balance, queryClient]);

  useEffect(() => {
    if (!depositWatch) return;
    const timeout = setTimeout(() => setDepositWatch(null), depositWatch.expiresAt - Date.now());
    return () => clearTimeout(timeout);
  }, [depositWatch]);

  const openAddFunds = useCallback(async () => {
    const checkoutConfig = buildFunkitCheckoutConfig(chain);
    if (!isConnected || !checkoutConfig) return false;
    hasConfirmedDepositRef.current = false;
    const { isActivated } = await beginCheckout(checkoutConfig);
    return isActivated;
  }, [chain, isConnected, beginCheckout]);

  return { openAddFunds, depositPending: depositWatch !== null };
};
