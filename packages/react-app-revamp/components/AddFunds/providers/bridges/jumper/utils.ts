import { LINK_JUMPER } from "@config/links";
import { findChainVoteCurrency } from "lib/voteCurrency";
import { zeroAddress } from "viem";

export const resolveBridgeTarget = (chainId: number, asset: string) => {
  const voteCurrency = findChainVoteCurrency(chainId);

  return voteCurrency?.kind === "token"
    ? { tokenAddress: voteCurrency.address, toToken: voteCurrency.address }
    : { tokenAddress: zeroAddress, toToken: asset };
};

export const getJumperBridgeUrl = (chainId: number, asset: string): string => {
  const params = new URLSearchParams({
    toChain: String(chainId),
    toToken: resolveBridgeTarget(chainId, asset).toToken,
  });

  return `${LINK_JUMPER}/?${params.toString()}`;
};
