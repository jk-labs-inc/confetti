import { Avatar } from "@components/UI/Avatar";
import CustomLink from "@components/UI/Link";
import { ROUTE_VIEW_USER } from "@config/routes";
import { entryMedal } from "@helpers/entryColors";
import useProfileData from "@hooks/useProfileData";
import { FC } from "react";
import { PositionedVote } from "../types";
import CastAmount from "./CastAmount";

interface VoterRowProps {
  vote: PositionedVote;
  formatPrice: (nativePrice: number) => string;
  entryTitlesById: Map<string, string>;
  rankById: Map<string, number>;
}

const VoterRow: FC<VoterRowProps> = ({ vote, formatPrice, entryTitlesById, rankById }) => {
  const { profileName: name, profileAvatar } = useProfileData(vote.userAddress, true);
  const title = entryTitlesById.get(vote.proposalId);
  const medal = entryMedal(rankById.get(vote.proposalId));

  return (
    <div className="flex items-center gap-2">
      <Avatar src={profileAvatar} address={vote.userAddress} size="extraSmall" />

      <CustomLink
        href={ROUTE_VIEW_USER.replace("[address]", vote.userAddress)}
        target="_blank"
        className="min-w-0 flex-1 truncate font-bold text-neutral-11 no-underline hover:underline"
      >
        {name}
      </CustomLink>

      <span className="flex max-w-[88px] flex-none items-center gap-1 text-neutral-11/55">
        <span className="size-2 flex-none rounded-full" style={{ backgroundColor: medal.solid }} />
        {title && <span className="truncate">{title}</span>}
      </span>

      <CastAmount cost={vote.totalCost} votes={vote.voteAmount} formatPrice={formatPrice} />
    </div>
  );
};

export default VoterRow;
