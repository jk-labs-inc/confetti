import ListProposalVotes from "@components/_pages/ListProposalVotes";
import GradientText from "@components/UI/GradientText";
import { VOTES_PER_PAGE } from "@hooks/useProposalVoters";
import { useProposalVoterAddresses } from "@hooks/useProposalVoters/hooks/useProposalVoterAddresses";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import Image from "next/image";
import { FC } from "react";
import { useShallow } from "zustand/shallow";
import EntryPreviewHeader from "@components/Voting/components/EntryPreviewHeader";
import VotingSidebarSignup from "../Signup";
import NoVotesPlaceholder from "./components/NoVotesPlaceholder";

interface VotingSidebarVotersProps {
  proposalId: string;
  image?: string;
  title?: string;
  contestName?: string;
}

const VotingSidebarVoters: FC<VotingSidebarVotersProps> = ({ proposalId, image, title, contestName }) => {
  const isVotingOpen = useContestStatusStore(state => state.contestStatus) === ContestStatus.VotingOpen;
  const contestConfig = useContestConfigStore(useShallow(state => state.contestConfig));
  const { addresses, totalCount, isLoading, error } = useProposalVoterAddresses({
    contractAddress: contestConfig.address,
    proposalId,
    chainId: contestConfig.chainId,
    abi: contestConfig.abi,
  });

  const hasNoVoters = !isLoading && !error && totalCount === 0;

  const isScrollable = totalCount > VOTES_PER_PAGE;

  return (
    <div className="bg-gradient-voting-area-purple rounded-4xl px-6 py-4 flex flex-col gap-4">
      {!isVotingOpen && (image || title || contestName) && (
        <div className="pb-4 border-b border-primary-3">
          <EntryPreviewHeader image={image} title={title} contestName={contestName} />
        </div>
      )}
      <div className="flex items-center gap-2 pr-6">
        <div className="flex items-baseline gap-2">
          <Image src="/entry/vote-ballot.svg" alt="voters" width={24} height={24} className="self-center" />
          <GradientText isFontSabo={false} textSizeClassName="text-[24px] font-bold">
            voters
          </GradientText>
          {totalCount > 0 && <p className="text-[16px] text-neutral-11 font-bold">{`(${totalCount})`}</p>}
        </div>
      </div>

      {error ? (
        <p className="text-[16px] text-negative-11 font-bold">
          ruh-roh! we were unable to fetch the voters, please reload the page.
        </p>
      ) : hasNoVoters ? (
        <NoVotesPlaceholder isVotingOpen={isVotingOpen} />
      ) : (
        <>
          <div className={`flex flex-col ${isScrollable ? "h-[256px]" : ""}`}>
            <ListProposalVotes
              proposalId={proposalId}
              votedAddresses={addresses}
              className="text-neutral-11 text-[12px]"
            />
          </div>
          {!isVotingOpen && (
            <div className="mt-4">
              <VotingSidebarSignup />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VotingSidebarVoters;
