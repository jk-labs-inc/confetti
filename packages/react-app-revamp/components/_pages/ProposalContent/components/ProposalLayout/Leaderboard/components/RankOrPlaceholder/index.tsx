import { Proposal } from "@components/_pages/ProposalContent";
import RankBadge from "@components/UI/RankBadge";
import { ContestStatus } from "@hooks/useContestStatus/store";
import { FC } from "react";

interface ProposalLayoutLeaderboardRankOrPlaceholderProps {
  proposal: Proposal;
  contestStatus: ContestStatus;
}

const MEDAL_IMAGES: Record<number, string> = {
  1: "/contest/gold-medal.png",
  2: "/contest/silver-medal.png",
  3: "/contest/bronze-medal.png",
};

const ProposalLayoutLeaderboardRankOrPlaceholder: FC<ProposalLayoutLeaderboardRankOrPlaceholderProps> = ({
  proposal,
  contestStatus,
}) => {
  if (proposal.rank) {
    const medalSrc = MEDAL_IMAGES[proposal.rank];
    if (medalSrc) {
      return (
        <img
          src={medalSrc}
          alt={`Rank ${proposal.rank}`}
          className="w-6 h-6 md:w-10 md:h-10 object-contain"
        />
      );
    } else {
      return (
        <>
          <div className="block md:hidden">
            <RankBadge rank={proposal.rank} size="sm" />
          </div>
          <div className="hidden md:block">
            <RankBadge rank={proposal.rank} size="md" />
          </div>
        </>
      );
    }
  } else {
    const isContestOpen = contestStatus === ContestStatus.ContestOpen || contestStatus === ContestStatus.SubmissionOpen;
    const isVotingOpen = contestStatus === ContestStatus.VotingOpen;
    if (isContestOpen || isVotingOpen) {
      return (
        <div className="w-6 h-6 md:w-10 md:h-10 flex items-center justify-center">
          <span className="relative flex h-3 w-3">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full  ${isContestOpen ? "bg-primary-10" : "bg-positive-11"} opacity-75`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${isContestOpen ? "bg-primary-10" : "bg-positive-11"}`}
            ></span>
          </span>
        </div>
      );
    } else {
      return <div className="w-3 h-3 md:w-10 md:h-10 flex items-center justify-center" />;
    }
  }
};

export default ProposalLayoutLeaderboardRankOrPlaceholder;
