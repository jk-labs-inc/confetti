import { Avatar } from "@components/UI/Avatar";
import CustomLink from "@components/UI/Link";
import { ROUTE_VIEW_USER } from "@config/routes";
import { formatNumber } from "@helpers/formatNumber";
import useProfileData from "@hooks/useProfileData";
import { FC } from "react";
import { PositionedVote } from "../types";
import CastAmount from "./CastAmount";
import CastRow from "./CastRow";

interface VoterGroupProps {
  address: string;
  casts: PositionedVote[];
  totalVotes: number;
  totalSpent: number;
  formatPrice: (nativePrice: number) => string;
  entryTitlesById: Map<string, string>;
  rankById: Map<string, number>;
}

const VoterGroup: FC<VoterGroupProps> = ({
  address,
  casts,
  totalVotes,
  totalSpent,
  formatPrice,
  entryTitlesById,
  rankById,
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

        <CastAmount cost={totalSpent} votes={totalVotes} formatPrice={formatPrice} formatVotes={formatNumber} />
      </div>

      <div className="flex flex-col gap-1 pl-8">
        {casts.map(cast => (
          <CastRow
            key={cast.uuid}
            vote={cast}
            formatPrice={formatPrice}
            entryTitlesById={entryTitlesById}
            rankById={rankById}
          />
        ))}
      </div>
    </div>
  );
};

export default VoterGroup;
