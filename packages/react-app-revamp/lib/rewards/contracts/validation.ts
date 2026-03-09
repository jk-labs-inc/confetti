import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import { readContracts } from "@wagmi/core";
import { compareVersions } from "compare-versions";
import { Abi } from "viem";
import { VOTER_REWARDS_VERSION } from "../types";

/**
 * Validates rankings
 */
export const validateRankings = async (
  rankings: number[],
  contractAddress: `0x${string}`,
  chainId: number,
  abi: Abi,
  version: string,
  creatorAddress?: `0x${string}`,
): Promise<{ validRankings: number[]; tiedRankings: number[] }> => {
  if (!rankings.length) return { validRankings: [], tiedRankings: [] };

  // check if this is an older version (before VOTER_REWARDS_VERSION)
  if (compareVersions(version, VOTER_REWARDS_VERSION) < 0) {
    try {
      // for older versions, use getAddressToPayOut
      const addressResults = await readContracts(getWagmiConfig(), {
        contracts: rankings.map(ranking => ({
          address: contractAddress,
          chainId,
          abi,
          functionName: "getAddressToPayOut",
          args: [BigInt(ranking)],
        })),
      });

      const validRankings: number[] = [];
      const tiedRankings: number[] = [];

      for (let i = 0; i < rankings.length; i++) {
        const payoutAddress = addressResults[i]?.result as `0x${string}` | undefined;
        if (payoutAddress !== undefined) {
          if (payoutAddress.toLowerCase() === creatorAddress?.toLowerCase()) {
            tiedRankings.push(rankings[i]);
          } else {
            validRankings.push(rankings[i]);
          }
        }
      }

      return { validRankings, tiedRankings };
    } catch (error) {
      console.error("Error validating rankings (older version):", error);
      return { validRankings: [], tiedRankings: [] };
    }
  }

  try {
    const proposalIdResults = await readContracts(getWagmiConfig(), {
      contracts: rankings.map(ranking => ({
        address: contractAddress,
        chainId,
        abi,
        functionName: "getProposalIdOfRanking",
        args: [BigInt(ranking)],
      })),
    });

    const validRankings: number[] = [];
    const tiedRankings: number[] = [];

    for (let i = 0; i < rankings.length; i++) {
      const proposalId = proposalIdResults[i]?.result as bigint | undefined;
      if (proposalId !== undefined) {
        if (proposalId === 0n) {
          tiedRankings.push(rankings[i]);
        } else {
          validRankings.push(rankings[i]);
        }
      }
    }

    return { validRankings, tiedRankings };
  } catch (error) {
    console.error("Error validating rankings (newer version):", error);
    return { validRankings: [], tiedRankings: [] };
  }
};
