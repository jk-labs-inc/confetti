import { useCastVotesStore } from "@hooks/useCastVotes/store";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { formatEther, parseEther } from "viem";
import { useReadContracts } from "wagmi";
import { useShallow } from "zustand/shallow";

interface UsePushToFirstProps {
  costToVote: string;
}

export const usePushToFirst = ({ costToVote }: UsePushToFirstProps): string | null => {
  const pickedProposal = useCastVotesStore(state => state.pickedProposal);
  const { address, chainId, abi } = useContestConfigStore(useShallow(state => state.contestConfig));

  const { data: pushToFirstAmount } = useReadContracts({
    contracts: [
      { address, abi, chainId, functionName: "allProposalTotalVotes" },
      { address, abi, chainId, functionName: "getAllDeletedProposalIds" },
    ],
    query: {
      enabled: !!pickedProposal && !!address && !!abi && !!chainId,
      select: data => {
        if (!pickedProposal) return null;

        const costToVoteNum = parseFloat(costToVote);
        if (isNaN(costToVoteNum) || costToVoteNum <= 0) return null;

        const allProposalsResult = data[0]?.result;
        if (!allProposalsResult || !Array.isArray(allProposalsResult)) return null;

        const allIds = allProposalsResult[0] as bigint[];
        const allVotes = allProposalsResult[1] as bigint[];
        const deletedIds = data[1]?.result;
        const deletedSet = new Set(
          Array.isArray(deletedIds) ? deletedIds.map((id: bigint) => id.toString()) : [],
        );

        let currentVotes = 0;
        let maxVotes = 0;
        let currentFound = false;

        for (let i = 0; i < allIds.length; i++) {
          const id = allIds[i].toString();
          if (deletedSet.has(id)) continue;

          const votes = Number(formatEther(allVotes[i]));

          if (votes > maxVotes) maxVotes = votes;
          if (id === pickedProposal) {
            currentVotes = votes;
            currentFound = true;
          }
        }

        if (!currentFound) return null;

        const currentVotesRounded = Math.round(currentVotes);
        const maxVotesRounded = Math.round(maxVotes);

        if (currentVotesRounded >= maxVotesRounded) return null;

        const votesNeeded = maxVotesRounded - currentVotesRounded + 1;

        const costToVoteWei = parseEther(costToVote);
        const totalCostWei = costToVoteWei * BigInt(votesNeeded) + 1n;
        return formatEther(totalCostWei);
      },
    },
  });

  return pushToFirstAmount ?? null;
};
