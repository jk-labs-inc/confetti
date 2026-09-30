import { Avatar } from "@components/UI/Avatar";
import CustomLink from "@components/UI/Link";
import { ROUTE_VIEW_USER } from "@config/routes";
import { formatNumberWithCommas } from "@helpers/formatNumber";
import { formatSharePercent } from "@helpers/percentages";
import { EntryVoter } from "@hooks/useEntryVoters";
import useProfileData from "@hooks/useProfileData";
import { FC } from "react";
import EntryVoterShareBar from "./ShareBar";

export type EntryVoterRowVariant = "popover" | "sheet";

interface EntryVoterRowProps {
  voter: EntryVoter;
  rank: number;
  variant: EntryVoterRowVariant;
}

const ROW_CLASS_NAME: Record<EntryVoterRowVariant, string> = {
  popover:
    "grid grid-cols-[16px_24px_minmax(0,1fr)_auto] items-center gap-2.5 py-2 border-b border-primary-2 last:border-b-0",
  sheet:
    "grid grid-cols-[16px_32px_minmax(0,1fr)_auto] items-center gap-3 py-[9px] border-b border-primary-2 last:border-b-0",
};

const NAME_CLASS_NAME: Record<EntryVoterRowVariant, string> = {
  popover: "text-[14px]",
  sheet: "text-[15px]",
};

const EntryVoterRow: FC<EntryVoterRowProps> = ({ voter, rank, variant }) => {
  const { profileName, profileAvatar } = useProfileData(voter.address, true);
  const isSheet = variant === "sheet";
  const accentClassName = voter.isViewer ? "text-secondary-11" : "text-neutral-11";

  return (
    <div className={ROW_CLASS_NAME[variant]}>
      <span className="text-right text-[12px] tabular-nums text-neutral-9">{rank}</span>
      <Avatar
        src={profileAvatar}
        address={voter.address}
        size={isSheet ? "small" : "extraSmall"}
        className="shrink-0"
      />
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <CustomLink
            href={ROUTE_VIEW_USER.replace("[address]", voter.address)}
            target="_blank"
            className={`truncate font-bold normal-case no-underline hover:underline ${NAME_CLASS_NAME[variant]} ${accentClassName}`}
          >
            {profileName}
          </CustomLink>
          {isSheet && voter.isViewer ? (
            <span className="shrink-0 rounded-lg border border-secondary-11 px-1.5 text-[11px] leading-4 text-secondary-11">
              you
            </span>
          ) : null}
        </div>
        {isSheet ? <EntryVoterShareBar fraction={voter.shareOfEntry} isViewer={voter.isViewer} /> : null}
      </div>
      <div className="flex flex-col items-end">
        <span className={`font-bold tabular-nums ${NAME_CLASS_NAME[variant]} ${accentClassName}`}>
          {formatNumberWithCommas(voter.votes)}
        </span>
        {isSheet ? (
          <span className="text-[12px] tabular-nums text-neutral-9">{formatSharePercent(voter.shareOfEntry)}</span>
        ) : null}
      </div>
    </div>
  );
};

export default EntryVoterRow;
