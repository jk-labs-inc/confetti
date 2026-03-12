import { Proposal } from "@components/_pages/ProposalContent";
import { FC } from "react";

interface ProposalLayoutTweetRankOrPlaceholderProps {
  proposal: Proposal;
}

const MEDAL_IMAGES: Record<number, string> = {
  1: "/contest/gold-medal.png",
  2: "/contest/silver-medal.png",
  3: "/contest/bronze-medal.png",
};

const ProposalLayoutTweetRankOrPlaceholder: FC<ProposalLayoutTweetRankOrPlaceholderProps> = ({ proposal }) => {
  if (proposal.rank) {
    const medalSrc = MEDAL_IMAGES[proposal.rank];
    if (medalSrc) {
      return <img src={medalSrc} alt={`Rank ${proposal.rank}`} className="w-10 h-10 object-contain" />;
    } else {
      return <p className="text-[16px] text-neutral-11 font-bold">{proposal.rank}</p>;
    }
  }
};

export default ProposalLayoutTweetRankOrPlaceholder;
