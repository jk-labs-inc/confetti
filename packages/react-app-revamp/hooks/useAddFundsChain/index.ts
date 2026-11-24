import { findChainIdByName } from "@helpers/getChainId";
import { useWallet } from "@hooks/useWallet";
import { findChainVoteCurrency } from "lib/voteCurrency";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

const fundingAssetSymbol = (chainId: number | undefined): string => findChainVoteCurrency(chainId)?.symbol ?? "";

/**
 * returns the chain name and asset symbol to use for the "add funds" modal.
 * onn contest page, uses the contest's chain (from the URL) so users add funds
 * on the chain they need to play. everywhere else, uses the wallet's connected chain.
 */
export function useAddFundsChain() {
  const pathname = usePathname();
  const { chain } = useWallet();

  return useMemo(() => {
    const segments = pathname?.split("/") ?? [];
    const isContestPage = segments[1] === "contest" && segments.length >= 4;

    if (isContestPage) {
      const contestChain = segments[2];
      return {
        chainName: contestChain,
        asset: fundingAssetSymbol(findChainIdByName(contestChain)),
      };
    }

    return {
      chainName: chain?.name.toLowerCase() ?? "",
      asset: fundingAssetSymbol(chain?.id),
    };
  }, [pathname, chain]);
}
