import { geoblockedModal } from "@components/AddFunds/components/GeoblockedModal/store";
import { scheduleBodyLockCleanup } from "@components/UI/Drawer";
import { toastError } from "@components/UI/Toast";
import { buildFunkitCheckoutConfig, getFunkitChain } from "@config/funkit";
import { useFunkitCheckout, useSoftHiddenCheckout } from "@funkit/connect";
import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import { useVoteCurrencyBalance } from "@hooks/useVoteCurrencyBalance";
import { useWallet } from "@hooks/useWallet";
import { useQueryClient } from "@tanstack/react-query";
import { getAccount, switchChain } from "@wagmi/core";
import { hideAddFundsMarker, showAddFundsMarker } from "lib/analytics/addFundsMarker";
import { findChainVoteCurrency } from "lib/voteCurrency";
import { useCallback, useEffect, useRef, useState } from "react";

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
  const hasUnclosedCheckoutRef = useRef(false);
  const { softHide, discard } = useSoftHiddenCheckout();

  const depositCurrency = findChainVoteCurrency(funkitChain?.id);
  const { balance } = useVoteCurrencyBalance({
    voteCurrency: depositCurrency,
    chainId: funkitChain?.id,
    owner: userAddress,
    refetchIntervalMs: depositWatch ? DEPOSIT_ARRIVAL_POLL_INTERVAL_MS : undefined,
  });

  const balanceValueRef = useRef<bigint | undefined>(undefined);
  useEffect(() => {
    balanceValueRef.current = balance;
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
      if (isNewDeposit) return;
      hasUnclosedCheckoutRef.current = false;
      if (isSoftHidden) return;
      hideAddFundsMarker();
      if (!hasConfirmedDepositRef.current || !funkitChain) return;
      const wagmiConfig = getWagmiConfig();
      const { chainId } = getAccount(wagmiConfig);
      if (chainId && chainId !== funkitChain.id) {
        switchChain(wagmiConfig, { chainId: funkitChain.id }).catch(() => {});
      }
    },
    onCheckoutBlocked: ({ blockedReason }) => {
      if (blockedReason !== "fullGeoblock") return;
      if (!hasUnclosedCheckoutRef.current || hasConfirmedDepositRef.current) return;
      hasUnclosedCheckoutRef.current = false;
      softHide();
      discard();
      scheduleBodyLockCleanup();
      hideAddFundsMarker();
      geoblockedModal.show();
    },
    onError: result => toastError({ message: result.message }),
  });

  useEffect(() => {
    if (!depositWatch || balance === undefined) return;
    if (depositWatch.startBalance === null) {
      setDepositWatch({ ...depositWatch, startBalance: balance });
      return;
    }
    if (balance <= depositWatch.startBalance) return;
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
    hasUnclosedCheckoutRef.current = true;
    const { isActivated } = await beginCheckout(checkoutConfig);
    if (!isActivated) {
      hasUnclosedCheckoutRef.current = false;
      return false;
    }
    if (hasUnclosedCheckoutRef.current) showAddFundsMarker();
    return true;
  }, [chain, isConnected, beginCheckout]);

  return { openAddFunds, depositPending: depositWatch !== null };
};
