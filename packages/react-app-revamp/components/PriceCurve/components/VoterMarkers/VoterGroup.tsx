import { Avatar } from "@components/UI/Avatar";
import CustomLink from "@components/UI/Link";
import { ROUTE_VIEW_USER } from "@config/routes";
import { formatNumber } from "@helpers/formatNumber";
import useProfileData from "@hooks/useProfileData";
import { FC } from "react";
import CastRow from "./CastRow";
import { PositionedVote } from "./types";

interface VoterGroupProps {
  address: string;
  casts: PositionedVote[];
  totalVotes: number;
  totalSpent: number;
  formatPrice: (nativePrice: number) => string;
  entryTitlesById: Map<string, string>;
  entryColorsById: Map<string, string>;
}

const VoterGroup: FC<VoterGroupProps> = ({
  address,
  casts,
  totalVotes,
  totalSpent,
  formatPrice,
  entryTitlesById,
  entryColorsById,
}) => {
  const { profileName: name, profileAvatar } = useProfileData(address, true);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <Avatar src={profileAvatar} address={address} size="extraSmall" />

        <CustomLink
          href={ROUTE_VIEW_USER.replace("[address]", address)}
          target="_blank"
          className="min-w-0 flex-1 truncate font-bold text-neutral-11 no-underline hover:underline"
        >
          {name}
        </CustomLink>

        <span className="flex-none whitespace-nowrap text-right tabular-nums">
          <span className="text-neutral-11">{formatPrice(totalSpent)}</span>
          <span className="text-neutral-11/50">
            {" · "}
            {formatNumber(totalVotes)} votes
          </span>
        </span>
      </div>

      <div className="flex flex-col gap-1 pl-8">
        {casts.map(cast => (
          <CastRow
            key={cast.uuid}
            vote={cast}
            formatPrice={formatPrice}
            entryTitlesById={entryTitlesById}
            entryColorsById={entryColorsById}
          />
        ))}
      </div>
    </div>
  );
};

export default VoterGroup;
