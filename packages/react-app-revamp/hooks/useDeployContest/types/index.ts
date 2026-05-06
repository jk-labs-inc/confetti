export type Recipient = {
  address: string;
  numVotes: string;
};

export type Charge = {
  percentageToRewards: number;
  creatorSplitEnabled?: number;
  costToVote: number;
  costToVoteEndPrice?: number;
  error?: boolean;
};

export interface PriceCurve {
  multiple: number;
  multipler: number;
  type: PriceCurveType;
}

export enum PriceCurveType {
  Exponential = 0,
  Logarithmic = 1,
}

export interface ContestValues {
  anyoneCanSubmit: number;
  datetimeOpeningSubmissions: Date;
  datetimeOpeningVoting: Date;
  datetimeClosingVoting: Date;
  title: string;
  prompt: string;
  contractAddress: string;
  networkName: string;
  cost_to_vote: number;
  percentage_to_rewards: number;
  creator_split_enabled?: number;
  authorAddress?: string;
  featured?: boolean;
}

export type DeploymentPhase =
  | "idle"
  | "deploying-contest"
  | "deploying-rewards"
  | "attaching-rewards"
  | "funding-pool"
  | "completed"
  | "failed";

export type TransactionStatus = "pending" | "loading" | "success" | "error";

export interface TransactionState {
  status: TransactionStatus;
  hash?: string;
  error?: string;
}

export interface DeploymentProcessState {
  phase: DeploymentPhase;
  transactions: {
    deployContest: TransactionState;
    deployRewards: TransactionState;
    attachRewards: TransactionState;
    fundTokens: Record<string, TransactionState>;
  };
  contestAddress?: string;
  rewardsModuleAddress?: string;
  chainId?: number;
}

export const createInitialDeploymentProcessState = (): DeploymentProcessState => ({
  phase: "idle",
  transactions: {
    deployContest: { status: "pending" },
    deployRewards: { status: "pending" },
    attachRewards: { status: "pending" },
    fundTokens: {},
  },
});

export const canNavigateToContest = (state: DeploymentProcessState, addFundsToRewards: boolean): boolean => {
  const contestDeployed = state.transactions.deployContest.status === "success";
  const rewardsDeployed = state.transactions.deployRewards.status === "success";
  const rewardsAttached = state.transactions.attachRewards.status === "success";
  const rewardsDeployFailed = state.transactions.deployRewards.status === "error";
  const rewardsAttachFailed = state.transactions.attachRewards.status === "error";

  if (!contestDeployed) {
    return false;
  }

  const fundTokenEntries = Object.entries(state.transactions.fundTokens);
  const hasFundingTransactions = fundTokenEntries.length > 0;
  const anyFundingFailed =
    hasFundingTransactions && fundTokenEntries.some(([_, txState]) => txState.status === "error");

  // If ANY reward phase fails, navigate immediately to contest page
  if (rewardsDeployFailed || rewardsAttachFailed || anyFundingFailed) {
    return true;
  }

  // All core reward phases must succeed before checking funding
  if (!rewardsDeployed || !rewardsAttached) {
    return false;
  }

  // If funding is enabled, wait for funding transactions to appear AND all succeed
  if (addFundsToRewards) {
    const allFundingSucceeded =
      hasFundingTransactions && fundTokenEntries.every(([_, txState]) => txState.status === "success");
    return allFundingSucceeded;
  }

  // If funding is not enabled, navigate as soon as core transactions succeed
  return true;
};
