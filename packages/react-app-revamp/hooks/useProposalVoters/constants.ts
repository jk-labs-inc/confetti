export const VOTES_PER_PAGE = 5;

export const VOTERS_STALE_TIME = 30_000;
export const VOTERS_GC_TIME = 5 * 60_000;

export const proposalVoterVotesQueryKey = (contractAddress: string, chainId: number, proposalId: string) =>
  ["proposalVoterVotes", contractAddress, chainId, proposalId] as const;
