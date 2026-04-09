export enum ProposalState {
  Deleted = "This entry has been deleted by the creator.",
}

export interface ProposalStaticData {
  description: string;
  author: string;
  exists: boolean;
  fieldsMetadata: {
    addressArray: string[];
    stringArray: string[];
    uintArray: bigint[];
  };
  isDeleted: boolean;
}

export interface ContestVoteTimings {
  voteStart: bigint;
  contestDeadline: bigint;
}

export const parseVoteTimings = (
  voteTimings: ContestVoteTimings | null,
): { votesOpen: Date; votesClose: Date } | null => {
  if (!voteTimings) return null;
  return {
    votesOpen: new Date(Number(voteTimings.voteStart) * 1000 + 1000),
    votesClose: new Date(Number(voteTimings.contestDeadline) * 1000 + 1000),
  };
};
