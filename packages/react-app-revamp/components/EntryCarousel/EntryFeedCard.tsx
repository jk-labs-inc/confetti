import EntryVotersChip from "@components/EntryVoters/Chip";
import MobileVoterCountLine from "@components/_pages/Contest/MobileVoterCountLine";
import { Proposal } from "@components/_pages/ProposalContent";
import ProposalLayoutGalleryRankOrPlaceholder from "@components/_pages/ProposalContent/components/ProposalLayout/Gallery/components/RankOrPlaceholder";
import { Tweet } from "@components/_pages/ProposalContent/components/ProposalLayout/Tweet/components/CustomTweet";
import VoteCountPulse from "@components/_pages/ProposalContent/components/VoteFeedback";
import { ENTRY_ACCENT_COLOR } from "@helpers/entryColors";
import { formatNumberWithCommas } from "@helpers/formatNumber";
import { ContestStatus } from "@hooks/useContestStatus/store";
import { EntryPreview } from "@hooks/useDeployContest/slices/contestMetadataSlice";
import { FC, useMemo } from "react";
import { ENTRY_ACCENT_GLOW, FOIL_PX, GRAIN_URL } from "./constants";
import { parseEntry } from "./parseEntry";
import ShadowCrossfade from "./ShadowCrossfade";

interface EntryFeedCardProps {
  proposal: Proposal;
  enabledPreview: EntryPreview | null;
  contestStatus: ContestStatus;
  active: boolean;
}

const EntryFeedCard: FC<EntryFeedCardProps> = ({ proposal, enabledPreview, contestStatus, active }) => {
  const entry = useMemo(() => parseEntry(proposal, enabledPreview), [proposal, enabledPreview]);
  const showVotes =
    (contestStatus === ContestStatus.VotingOpen || contestStatus === ContestStatus.VotingClosed) && proposal.votes > 0;
  const showHeader = !!proposal.rank || !!entry.title || showVotes;

  return (
    <div
      className="relative w-full rounded-2xl"
      style={{ background: active ? ENTRY_ACCENT_COLOR : "transparent", padding: FOIL_PX }}
    >
      <ShadowCrossfade activeShadow={ENTRY_ACCENT_GLOW} restingShadow="var(--shadow-entry-card)" active={active} />
      <div className="relative isolate flex w-full flex-col gap-4 overflow-hidden rounded-[14px] bg-true-black p-2">
        {showHeader ? (
          <div className="flex w-full items-center pl-2">
            {proposal.rank ? <ProposalLayoutGalleryRankOrPlaceholder rank={proposal.rank} /> : null}
            <div className="ml-auto flex items-center gap-2">
              {active ? <EntryVotersChip proposalId={proposal.id} enabled reserveSpace /> : null}
              <div className="flex flex-col items-end gap-1">
                {entry.title ? <p className="text-[12px] font-bold text-neutral-11">{entry.title}</p> : null}
                {showVotes ? (
                  <p className="text-[12px] text-neutral-11">
                    <VoteCountPulse votes={proposal.votes}>{formatNumberWithCommas(proposal.votes)}</VoteCountPulse>{" "}
                    votes
                  </p>
                ) : null}
                {active ? <MobileVoterCountLine proposalId={proposal.id} /> : null}
              </div>
            </div>
          </div>
        ) : null}

        {entry.kind === "tweet" ? <Tweet id={entry.tweetId} apiUrl={`/api/tweet/${entry.tweetId}`} /> : null}

        <div
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: GRAIN_URL, backgroundSize: "120px 120px", opacity: 0.06 }}
        />
      </div>
    </div>
  );
};

export default EntryFeedCard;
