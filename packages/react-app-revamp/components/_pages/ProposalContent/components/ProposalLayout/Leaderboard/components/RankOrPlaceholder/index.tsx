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
    }
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

  return <div className="w-6 h-6 md:w-10 md:h-10" />;
};

export default ProposalLayoutLeaderboardRankOrPlaceholder;
