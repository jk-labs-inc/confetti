import { isXClaimConfigured } from "@config/xClaim";
import { useAccount } from "@getpara/react-sdk-lite";
import { useWallet } from "@hooks/useWallet";
import type { XClaimSpots } from "lib/xClaim/types";
import { openSpotsOn } from "lib/xClaim/view";
import { useParams } from "next/navigation";
import { useXClaimSpots } from "./queries";

export const useSignedOutOpenSpots = (): { spots: XClaimSpots | null; isResolved: boolean } => {
  const { isConnected } = useWallet();
  const { isLoading: isAccountLoading } = useAccount();
  const params = useParams();
  const contestChain = typeof params?.chain === "string" ? params.chain.toLowerCase() : null;
  const { data, isError } = useXClaimSpots({ enabled: !isConnected });
  const isSignedOut = !isAccountLoading && !isConnected;
  const isSpotsAnswered = !isXClaimConfigured || data !== undefined || isError;

  return {
    spots: isSignedOut && data ? openSpotsOn(data, contestChain) : null,
    isResolved: !isAccountLoading && (isConnected || isSpotsAnswered),
  };
};
