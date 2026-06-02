import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import { ProposalCore } from "@hooks/useProposal/store";
import { readContract, readContracts } from "@wagmi/core";
import { compareVersions } from "compare-versions";
import { Abi, formatEther } from "viem";
import { ReconcileProposalVotesArgs, RefreshProposalVotesArgs } from "./types";

// Raw `proposalVotes` -> netVotes, handling the <5.1 for/against tuple.
function toNetVotes(raw: unknown, hasDownvotes: boolean): number {
  return hasDownvotes
    ? Number(formatEther(BigInt((raw as [bigint, bigint])[0]) - BigInt((raw as [bigint, bigint])[1])))
    : Number(formatEther(BigInt(raw as bigint)));
}

// A realtime row is only a trigger — the contract is the source of truth — so re-read the tally on
// chain and never trust the row's per-vote `vote_amount`. updateProposal re-ranks + re-sorts.
export async function refreshProposalVotes({
  contestConfig,
  proposalId,
  listProposalsData,
  updateProposal,
}: RefreshProposalVotesArgs): Promise<void> {
  const hasDownvotes = contestConfig.version ? compareVersions(contestConfig.version, "5.1") < 0 : false;

  const raw = await readContract(getWagmiConfig(), {
    address: contestConfig.address,
    abi: contestConfig.abi as Abi,
    chainId: contestConfig.chainId,
    functionName: "proposalVotes",
    args: [proposalId],
  });

  const netVotes = toNetVotes(raw, hasDownvotes);

  const existing = listProposalsData.find(proposal => proposal.id === proposalId);

  // For a proposal not on a loaded page, a minimal object still refreshes the ranking map
  // (updateProposal reads only id + netVotes for non-listed ids); it isn't injected into the list.
  const updated: ProposalCore = existing
    ? { ...existing, netVotes }
    : ({ id: proposalId, netVotes } as ProposalCore);

  updateProposal(updated, listProposalsData);
}

// After a reconnect, re-sync every loaded proposal from chain in ONE batched read (postgres_changes
// drops events during a long drop). Only changed entries are written back.
export async function reconcileProposalVotes({
  contestConfig,
  listProposalsData,
  updateProposal,
}: ReconcileProposalVotesArgs): Promise<void> {
  if (listProposalsData.length === 0) return;

  const hasDownvotes = contestConfig.version ? compareVersions(contestConfig.version, "5.1") < 0 : false;

  const results = await readContracts(getWagmiConfig(), {
    contracts: listProposalsData.map(proposal => ({
      address: contestConfig.address,
      abi: contestConfig.abi as Abi,
      chainId: contestConfig.chainId,
      functionName: "proposalVotes",
      args: [proposal.id],
    })),
  });

  // Thread an evolving snapshot so each updateProposal re-ranks against the prior entry's change.
  let current = listProposalsData;
  results.forEach((result, index) => {
    if (result.status !== "success" || result.result == null) return;

    const proposal = listProposalsData[index];
    const netVotes = toNetVotes(result.result, hasDownvotes);
    if (proposal.netVotes === netVotes) return;

    const updated: ProposalCore = { ...proposal, netVotes };
    updateProposal(updated, current);
    current = current.map(p => (p.id === updated.id ? updated : p));
  });
}
