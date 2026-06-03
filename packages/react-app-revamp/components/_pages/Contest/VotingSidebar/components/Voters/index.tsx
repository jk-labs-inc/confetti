import ListProposalVotes from "@components/_pages/ListProposalVotes";
import GradientText from "@components/UI/GradientText";
import RefreshButton from "@components/UI/RefreshButton";
import { VOTES_PER_PAGE } from "@hooks/useProposalVoters";
import { useProposalVoterAddresses } from "@hooks/useProposalVoters/hooks/useProposalVoterAddresses";
import { invalidateProposalVoters } from "@hooks/useProposalVoters/invalidate";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { FC } from "react";
import { useShallow } from "zustand/shallow";

interface VotingSidebarVotersProps {
  proposalId: string;
}

const VotingSidebarVoters: FC<VotingSidebarVotersProps> = ({ proposalId }) => {
  const contestConfig = useContestConfigStore(useShallow(state => state.contestConfig));
  const queryClient = useQueryClient();
  const { addresses, totalCount, isLoading, error } = useProposalVoterAddresses({
    contractAddress: contestConfig.address,
    proposalId,
    chainId: contestConfig.chainId,
    abi: contestConfig.abi,
  });

  const handleRefresh = () => {
    invalidateProposalVoters(queryClient, {
      contractAddress: contestConfig.address,
      chainId: contestConfig.chainId,
      proposalId,
    });
  };

  const hasNoVoters = !isLoading && !error && totalCount === 0;

  const isScrollable = totalCount > VOTES_PER_PAGE;

  return (
    <div className="bg-gradient-voting-area-purple rounded-4xl px-6 py-4 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2 pr-6">
        <div className="flex items-baseline gap-2">
          <Image src="/entry/vote-ballot.svg" alt="voters" width={24} height={24} className="self-center" />
          <GradientText isFontSabo={false} textSizeClassName="text-[24px] font-bold">
            voters
          </GradientText>
          {totalCount > 0 && <p className="text-[16px] text-neutral-11 font-bold">{`(${totalCount})`}</p>}
        </div>
        <RefreshButton onRefresh={handleRefresh} size="md" />
      </div>

      {error ? (
        <p className="text-[16px] text-negative-11 font-bold">
          ruh-roh! we were unable to fetch the voters, please reload the page.
        </p>
      ) : hasNoVoters ? (
        <p className="text-[16px] text-neutral-11">this entry doesn’t have any votes. yet.</p>
      ) : (
        <div className={`flex flex-col ${isScrollable ? "h-[256px]" : ""}`}>
          <ListProposalVotes
            proposalId={proposalId}
            votedAddresses={addresses}
            className="text-neutral-11 text-[12px]"
          />
        </div>
      )}
    </div>
  );
};

export default VotingSidebarVoters;
