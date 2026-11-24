"use client";
import ClaimVoteRuntime from "@components/ClaimVote/ClaimVoteRuntime";
import { isXClaimConfigured } from "@config/xClaim";
import { ClaimVoteStoreProvider } from "@hooks/useClaimVote/store";
import { CastVotesWrapper } from "@hooks/useCastVotes/store";
import { ContestWrapper } from "@hooks/useContest/store";
import { ContestConfigStoreProvider } from "@hooks/useContestConfig/store";
import { DeleteProposalWrapper } from "@hooks/useDeleteProposal/store";
import { ProposalWrapper } from "@hooks/useProposal/store";
import LayoutViewContest from "@layouts/LayoutViewContest";
import { chainVoteCurrency } from "lib/voteCurrency";
import { FC } from "react";
import { Abi } from "viem";

interface ContestProps {
  address: string;
  chain: string;
  chainId: number;
  abi: Abi;
  version: string;
}

const Contest: FC<ContestProps> = ({ address, chain, chainId, abi, version }) => {
  const voteCurrency = chainVoteCurrency(chainId);
  const contestConfig = {
    address: address as `0x${string}`,
    chainName: chain,
    chainId,
    voteCurrency,
    abi,
    version,
  };

  return (
    <ContestWrapper>
      <ProposalWrapper>
        <DeleteProposalWrapper>
          <CastVotesWrapper>
            <ContestConfigStoreProvider contestConfig={contestConfig}>
              <ClaimVoteStoreProvider>
                {isXClaimConfigured && voteCurrency.kind === "native" && <ClaimVoteRuntime />}
                <LayoutViewContest />
              </ClaimVoteStoreProvider>
            </ContestConfigStoreProvider>
          </CastVotesWrapper>
        </DeleteProposalWrapper>
      </ProposalWrapper>
    </ContestWrapper>
  );
};

export default Contest;
