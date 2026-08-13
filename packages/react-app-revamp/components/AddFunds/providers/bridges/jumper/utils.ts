import { LINK_JUMPER } from "@config/links";

export const getJumperBridgeUrl = (chainId: number, asset: string): string => {
  const params = new URLSearchParams({
    toChain: String(chainId),
    toToken: asset,
  });

  return `${LINK_JUMPER}/?${params.toString()}`;
};
