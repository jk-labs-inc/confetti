import CustomLink from "@components/UI/Link";
import { ROUTE_VIEW_USER } from "@config/routes";
import { LeaderboardRow } from "@hooks/useContestLeaderboard";
import { FC } from "react";
import { ME_LABEL } from "../../constants";

interface VoterNameProps {
  row: LeaderboardRow;
  profileName: string;
  meClassName: string;
  linkClassName: string;
}

const VoterName: FC<VoterNameProps> = ({ row, profileName, meClassName, linkClassName }) =>
  row.isViewer ? (
    <p className={`text-true-white ${meClassName}`}>{ME_LABEL}</p>
  ) : (
    <CustomLink
      href={ROUTE_VIEW_USER.replace("[address]", row.address)}
      target="_blank"
      className={`block truncate normal-case text-neutral-11 no-underline hover:underline ${linkClassName}`}
    >
      {profileName}
    </CustomLink>
  );

export default VoterName;
