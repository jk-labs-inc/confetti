import { Avatar } from "@components/UI/Avatar";
import CustomLink from "@components/UI/Link";
import { ROUTE_VIEW_USER } from "@config/routes";
import useProfileData from "@hooks/useProfileData";
import { FC } from "react";
import { NEUTRAL_ENTRY_COLOR } from "./entryColors";
import { PositionedVote } from "./types";

interface VoterRowProps {
  vote: PositionedVote;
  formatPrice: (nativePrice: number) => string;
  entryTitlesById: Map<string, string>;
  entryColorsById: Map<string, string>;
}

const VoterRow: FC<VoterRowProps> = ({ vote, formatPrice, entryTitlesById, entryColorsById }) => {
  const { profileName: name, profileAvatar } = useProfileData(vote.userAddress, true);
  const title = entryTitlesById.get(vote.proposalId);
  const color = entryColorsById.get(vote.proposalId) ?? NEUTRAL_ENTRY_COLOR;

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
        <span className="size-2 flex-none rounded-full" style={{ backgroundColor: color }} />
        {title && <span className="truncate">{title}</span>}
      </span>

      <span className="flex-none whitespace-nowrap text-right tabular-nums">
        <span className="text-neutral-11">{formatPrice(vote.totalCost)}</span>
        <span className="text-neutral-11/50">
          {" · "}
          {vote.voteAmount} {vote.voteAmount === 1 ? "vote" : "votes"}
        </span>
      </span>
    </div>
  );
};

export default VoterRow;
