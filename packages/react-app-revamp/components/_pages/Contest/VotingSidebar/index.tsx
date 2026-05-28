import AddFunds from "@components/AddFunds";
import VotingWidget, { VotingWidgetStyle } from "@components/Voting";
import ContestImage from "@components/_pages/Contest/components/ContestImage";
import { verifyEntryPreviewPrompt } from "@components/_pages/DialogModalSendProposal/utils";
import useCastVotes from "@hooks/useCastVotes";
import { useCastVotesStore } from "@hooks/useCastVotes/store";
import { useContestStore } from "@hooks/useContest/store";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import useCurrentPricePerVote from "@hooks/useCurrentPricePerVote";
import { useMetadataStore } from "@hooks/useMetadataFields/store";
import { useProposalStore } from "@hooks/useProposal/store";
import { FC, useState } from "react";
import { useShallow } from "zustand/shallow";
import { getEntryPreview } from "./getEntryPreview";
import { useAutoPickFirstProposal } from "./useAutoPickFirstProposal";

const VotingSidebar: FC = () => {
  useAutoPickFirstProposal();
  const { contestConfig } = useContestConfigStore(useShallow(state => state));
  const { charge: contestCharge, votingClose, contestName } = useContestStore(
    useShallow(state => ({
      charge: state.charge,
      votingClose: state.votesClose,
      contestName: state.contestName,
    })),
  );
  const { listProposalsData, submissionsCount } = useProposalStore(
    useShallow(state => ({
      listProposalsData: state.listProposalsData,
      submissionsCount: state.submissionsCount,
    })),
  );
  const metadataFieldsConfig = useMetadataStore(state => state.fields);
  const contestStatus = useContestStatusStore(useShallow(state => state.contestStatus));
  const contestState = useContestStateStore(useShallow(state => state.contestState));
  const pickedProposal = useCastVotesStore(state => state.pickedProposal);
  const { castVotes, isLoading } = useCastVotes({ charge: contestCharge, votesClose: votingClose });
  const [showAddFunds, setShowAddFunds] = useState(false);
  const {
    currentPricePerVote,
    currentPricePerVoteRaw,
    isLoading: isCurrentPricePerVoteLoading,
  } = useCurrentPricePerVote({
    address: contestConfig.address,
    abi: contestConfig.abi,
    chainId: contestConfig.chainId,
    votingClose,
  });

  const onVote = async (amount: number) => {
    try {
      await castVotes(amount);
    } finally {
      setShowAddFunds(false);
    }
  };

  const isContestCanceled = contestState === ContestStateEnum.Canceled;
  const isVotingOpen = contestStatus === ContestStatus.VotingOpen;

  if (isContestCanceled || !isVotingOpen || !pickedProposal) return null;

  const pickedProposalData = listProposalsData.find(p => p.id === pickedProposal);
  const { enabledPreview } =
    metadataFieldsConfig.length > 0
      ? verifyEntryPreviewPrompt(metadataFieldsConfig[0].prompt)
      : { enabledPreview: null };
  const { image, title } = getEntryPreview(pickedProposalData, enabledPreview);

  return (
    <div className="bg-primary-1 rounded-4xl p-4">
      <div
        className={`px-6 py-4 rounded-4xl flex flex-col gap-4 ${showAddFunds ? "bg-primary-13" : "bg-gradient-voting-area-purple"}`}
      >
        {!showAddFunds && (image || title || contestName) && (
          <div className="flex items-center gap-3">
            {image && <ContestImage imageUrl={image} size="small" />}
            {(contestName || title) && (
              <div className="min-w-0 flex flex-col">
                {contestName && <p className="truncate text-[14px] text-neutral-9">{contestName}</p>}
                {title && <p className="truncate text-[16px] text-neutral-11 font-bold">{title}</p>}
              </div>
            )}
          </div>
        )}

        {showAddFunds ? (
          <div className="animate-appear">
            <AddFunds
              chain={contestConfig.chainName}
              asset={contestConfig.chainNativeCurrencySymbol ?? ""}
              onGoBack={() => setShowAddFunds(false)}
              onBridgeSuccess={() => setShowAddFunds(false)}
            />
          </div>
        ) : (
          <>
            <VotingWidget
              key={pickedProposal}
              costToVote={currentPricePerVote}
              costToVoteRaw={currentPricePerVoteRaw}
              style={VotingWidgetStyle.colored}
              isLoading={isCurrentPricePerVoteLoading || isLoading}
              isVotingClosed={false}
              isContestCanceled={isContestCanceled}
              onVote={onVote}
              onAddFunds={() => setShowAddFunds(true)}
              submissionsCount={submissionsCount}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default VotingSidebar;
