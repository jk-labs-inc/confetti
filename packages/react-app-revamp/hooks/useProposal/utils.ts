import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import { isContentTweet } from "@helpers/isContentTweet";
import isUrlToImage from "@helpers/isUrlToImage";
import { readContract, readContracts } from "@wagmi/core";
import { formatEther } from "viem";
import { MappedProposalIds, ProposalCore } from "./store";
import { ContractConfig } from "@hooks/useContest";
import { compareVersions } from "compare-versions";

export interface RawMetadataFields {
  addressArray: string[];
  stringArray: string[];
  uintArray: bigint[];
}

const defaultMetadataFields: RawMetadataFields = {
  addressArray: [],
  stringArray: [],
  uintArray: [],
};

export function mapResultToStringArray(result: any): string[] {
  if (Array.isArray(result)) {
    return result.map((id: bigint) => id.toString());
  } else {
    return [result.toString()];
  }
}

/**
 * Assign ranks to proposals based on votes from the complete proposals list.
 */
export function rankProposals(
  proposals: ProposalCore[],
  allProposalsIdsAndVotes: MappedProposalIds[],
): ProposalCore[] {
  const sortedAll = [...allProposalsIdsAndVotes].sort((a, b) => b.votes - a.votes);

  const rankMap = new Map<string, number>();
  const rankCounts = new Map<number, number>();
  let currentRank = 0;
  let lastVotes: number | null = null;

  for (const { id, votes } of sortedAll) {
    if (votes !== lastVotes) {
      lastVotes = votes;
      if (votes > 0) currentRank++;
    }
    const rank = votes > 0 ? currentRank : 0;
    rankMap.set(id, rank);
    rankCounts.set(rank, (rankCounts.get(rank) ?? 0) + 1);
  }

  return proposals
    .map(proposal => {
      const rank = rankMap.get(proposal.id) ?? 0;
      return {
        ...proposal,
        rank,
        isTied: rank > 0 && (rankCounts.get(rank) ?? 0) > 1,
      };
    })
    .sort((a, b) => {
      if (a.rank === 0 && b.rank === 0) return 0;
      if (a.rank === 0) return 1;
      if (b.rank === 0) return -1;
      return a.rank - b.rank;
    });
}

/**
 * Transforms a single proposal's data based on its ID and result data.
 * @param id - The ID of the proposal.
 * @param voteData - The voting data of the proposal.
 * @param proposalData - The detailed data of the proposal.
 * @returns An object representing the transformed proposal data.
 */
export function transformProposalData(
  id: any,
  voteData: any,
  proposalData: any,
  proposalCommentsIds: bigint[] = [],
  deletedCommentIds: bigint[] = [],
  version: string,
) {
  let netVotes: number;

  const hasDownvotes = version ? compareVersions(version, "5.1") < 0 : false;

  if (hasDownvotes) {
    const voteForBigInt = BigInt(voteData.result[0]);
    const voteAgainstBigInt = BigInt(voteData.result[1]);
    netVotes = Number(formatEther(voteForBigInt - voteAgainstBigInt));
  } else {
    netVotes = Number(formatEther(BigInt(voteData.result)));
  }

  const isContentImage = isUrlToImage(proposalData.description);
  const tweet = isContentTweet(proposalData.description);
  const deletedCommentIdsSet = new Set(deletedCommentIds.map(id => id.toString()));
  const allCommentsIds = proposalCommentsIds.map(id => id.toString()).filter(id => !deletedCommentIdsSet.has(id));

  const { fieldsMetadata, ...restProposalData } = proposalData;
  const metadataFields: RawMetadataFields = fieldsMetadata
    ? {
        addressArray: fieldsMetadata.addressArray ?? defaultMetadataFields.addressArray,
        stringArray: fieldsMetadata.stringArray ?? defaultMetadataFields.stringArray,
        uintArray: fieldsMetadata.uintArray ?? defaultMetadataFields.uintArray,
      }
    : defaultMetadataFields;

  return {
    id: id.toString(),
    ...restProposalData,
    metadataFields,
    isContentImage,
    tweet,
    netVotes,
    commentsCount: allCommentsIds.length,
  };
}

/**
 * Gets the proposal ids from the contract.
 * @param contractConfig - Configuration for the contract
 * @param isLegacy - Whether to use legacy function
 * @param version - Contract version string
 */
export async function getProposalIdsRaw(contractConfig: ContractConfig, isLegacy: boolean, version?: string) {
  const hasDownvotes = version ? compareVersions(version, "5.1") < 0 : false;

  if (isLegacy) {
    return (await readContract(getWagmiConfig(), {
      ...contractConfig,
      functionName: "getAllProposalIds",
      args: [],
    })) as any;
  } else {
    const contracts = [
      {
        ...contractConfig,
        functionName: "allProposalTotalVotes",
        args: [],
      },
      {
        ...contractConfig,
        functionName: "getAllDeletedProposalIds",
        args: [],
      },
    ];

    const results: any[] = await readContracts(getWagmiConfig(), { contracts });

    const allProposals = results[0].result[0];
    const deletedIdsArray = results[1]?.result;

    if (!deletedIdsArray) {
      return [allProposals, results[0].result[1]];
    }

    const deletedProposalSet = new Set(mapResultToStringArray(deletedIdsArray));

    const validData = allProposals.reduce(
      (
        accumulator: { validProposalIds: any[]; correspondingVotes: any[] },
        proposalId: { toString: () => string },
        index: string | number,
      ) => {
        if (!deletedProposalSet.has(proposalId.toString())) {
          accumulator.validProposalIds.push(proposalId);

          if (hasDownvotes) {
            accumulator.correspondingVotes.push({
              forVotes: results[0].result[1][index].forVotes,
              againstVotes: results[0].result[1][index].againstVotes,
            });
          } else {
            accumulator.correspondingVotes.push(results[0].result[1][index]);
          }
        }
        return accumulator;
      },
      { validProposalIds: [], correspondingVotes: [] },
    );

    return [validData.validProposalIds, validData.correspondingVotes];
  }
}
