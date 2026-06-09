import { ContestConfig } from "@hooks/useContestConfig/store";
import { ProposalCore } from "@hooks/useProposal/store";
import { ContestParticipantEvent } from "lib/realtime";

export type VoteEvent = Extract<ContestParticipantEvent, { type: "vote.cast" }>;
export type DeletedEvent = Extract<ContestParticipantEvent, { type: "entry.deleted" }>;
export type SubmittedEvent = Extract<ContestParticipantEvent, { type: "entry.submitted" }>;

export interface ParticipantsHandlerDeps {
  onVote: (event: VoteEvent) => void;
  onDelete?: (event: DeletedEvent) => void;
  onSubmit?: (event: SubmittedEvent) => void;
}

export interface RefreshProposalVotesArgs {
  contestConfig: ContestConfig;
  proposalId: string;
  updateProposal: (updated: ProposalCore) => void;
}

export interface ReconcileProposalVotesArgs {
  contestConfig: ContestConfig;
  listProposalsData: ProposalCore[];
  updateProposal: (updated: ProposalCore) => void;
}
