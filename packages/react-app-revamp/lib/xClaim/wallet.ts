import type { WalletKind } from "@hooks/useWallet";
import type { LoginMethod } from "@getpara/react-sdk-lite";
import type { Address } from "viem";
import type { XClaimWallet } from "./types";

export const toXClaimWallet = ({
  userAddress,
  isConnected,
  walletKind,
  loginMethod,
  walletName,
}: {
  userAddress: Address | undefined;
  isConnected: boolean;
  walletKind: WalletKind | undefined;
  loginMethod: LoginMethod | undefined;
  walletName: string | null;
}): XClaimWallet => {
  if (!isConnected || !userAddress || !walletKind) return { kind: "signed_out" };
  if (walletKind === "external") return { kind: "external", address: userAddress, walletName };
  return { kind: "embedded", address: userAddress, signedInWithX: loginMethod === "TWITTER" };
};

export const walletAddressOf = (wallet: XClaimWallet) => (wallet.kind === "signed_out" ? null : wallet.address);
