export type VoteInfoBlockType = "my-votes" | "total-votes";

interface BaseVoteInfoBlocksProps {
  type: VoteInfoBlockType;
}

export interface MyVotesProps extends BaseVoteInfoBlocksProps {
  type: "my-votes";
  balance: string;
  symbol: string;
  insufficientBalance: boolean;
  isConnected: boolean;
  onAddFunds?: () => void;
}

export interface TotalVotesProps extends BaseVoteInfoBlocksProps {
  type: "total-votes";
  costToVote: string;
  spendableBalance: string;
  isBelowMinimum?: boolean;
}

export type VoteInfoBlocksProps = MyVotesProps | TotalVotesProps;
