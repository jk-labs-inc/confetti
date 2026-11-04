import { useWallet } from "@hooks/useWallet";
import { spotsTakenUntil } from "lib/xClaim/view";
import { useParams } from "next/navigation";
import { useXClaimSpots } from "./queries";

export const useSpotsTakenUntil = (): Date | null => {
  const { isConnected } = useWallet();
  const params = useParams();
  const contestChain = typeof params?.chain === "string" ? params.chain.toLowerCase() : null;
  const { data: spots } = useXClaimSpots({ enabled: !isConnected });
  return !isConnected && spots ? spotsTakenUntil(spots, contestChain) : null;
};
