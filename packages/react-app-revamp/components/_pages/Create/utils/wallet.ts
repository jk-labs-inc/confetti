import { toastError } from "@components/UI/Toast";
import { ErrorToastType } from "@components/UI/Toast/components/Error";

const FORBIDDEN_WALLETS: Record<string, string> = {
  coinbaseWalletSDK: "Coinbase Wallet",
  rainbow: "Rainbow Wallet",
  zerion: "Zerion Wallet",
};

const isWalletForbidden = (walletId: string) => {
  return walletId in FORBIDDEN_WALLETS;
};

const displayWalletWarning = (walletId: string) => {
  const displayName = FORBIDDEN_WALLETS[walletId] ?? walletId;

  return toastError({
    message: `${displayName} does not support creating a contest.`,
    type: ErrorToastType.SIMPLE,
  });
};

export { displayWalletWarning, isWalletForbidden };
