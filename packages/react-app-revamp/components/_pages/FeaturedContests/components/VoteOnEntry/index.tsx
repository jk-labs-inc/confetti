import { getNativeTokenSymbol } from "@helpers/nativeToken";
import { CastVotesWrapper } from "@hooks/useCastVotes/store";
import { ContestWrapper } from "@hooks/useContest/store";
import { ContestCardConfig } from "@hooks/useContestCardConfig";
import { ContestConfigStoreProvider } from "@hooks/useContestConfig/store";
import { ProposalWrapper } from "@hooks/useProposal/store";
import { ProcessedContest } from "lib/contests/types";
import { FC, useEffect, useState } from "react";
import { CardEntry } from "../Contest/types";
import VoteOnEntryContent from "./components/Content";

interface FeaturedContestVoteOnEntryProps {
  contest: ProcessedContest;
  config: ContestCardConfig;
  entry: CardEntry;
  submissionsCount: number;
  isOpen: boolean;
  onClose: () => void;
  onVoteSuccess?: (result: { proposalId: string; amountOfVotes: number }) => void;
}

const FeaturedContestVoteOnEntry: FC<FeaturedContestVoteOnEntryProps> = ({
  contest,
  config,
  entry,
  submissionsCount,
  isOpen,
  onClose,
  onVoteSuccess,
}) => {
  const [hasOpened, setHasOpened] = useState(false);

  useEffect(() => {
    if (isOpen) setHasOpened(true);
  }, [isOpen]);

  if (!hasOpened) return null;

  const contestConfig = {
    address: config.address,
    chainName: config.chainName,
    chainId: config.chainId,
    chainNativeCurrencySymbol: getNativeTokenSymbol(config.chainName) ?? "",
    abi: config.abi,
    version: config.version,
  };

  return (
    <ContestWrapper>
      <ProposalWrapper>
        <CastVotesWrapper>
          <ContestConfigStoreProvider contestConfig={contestConfig}>
            <VoteOnEntryContent
              proposalId={entry.id}
              entryPreview={{ image: entry.image, title: entry.title, contestName: contest.title }}
              submissionsCount={submissionsCount}
              votesClose={new Date(contest.end_at)}
              isCanceled={contest.isCanceled}
              isOpen={isOpen}
              onClose={onClose}
              onVoteSuccess={onVoteSuccess}
            />
          </ContestConfigStoreProvider>
        </CastVotesWrapper>
      </ProposalWrapper>
    </ContestWrapper>
  );
};

export default FeaturedContestVoteOnEntry;
