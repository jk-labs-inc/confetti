import { PositionedVote } from "@components/PriceCurve/components/Voters/types";
import { Avatar } from "@components/UI/Avatar";
import CustomLink from "@components/UI/Link";
import { ROUTE_VIEW_USER } from "@config/routes";
import { formatVoteCount } from "@helpers/formatNumber";
import { formatTimeAgo } from "@helpers/dates";
import { NativePriceFormatter } from "@hooks/useNativePriceFormatter";
import useNow from "@hooks/useNow";
import useProfileData from "@hooks/useProfileData";
import { FC } from "react";
import { TICKER_AVATAR_PX, TICKER_ENTRY_TITLE_CLASS_NAME, TICKER_UNKNOWN_ENTRY_LABEL } from "../../constants";

interface TickerEventProps {
  vote: PositionedVote;
  entryTitle?: string;
  formatPrice: NativePriceFormatter;
}

const TickerEvent: FC<TickerEventProps> = ({ vote, entryTitle, formatPrice }) => {
  const { profileName, profileAvatar } = useProfileData(vote.userAddress, true);
  const now = useNow();
  const spendText = vote.amountSent === null ? formatVoteCount(vote.voteAmount) : formatPrice(vote.totalCost);

  return (
    <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[12px] normal-case text-neutral-9">
      <Avatar src={profileAvatar} address={vote.userAddress} sizePx={TICKER_AVATAR_PX} className="shrink-0" />
      <CustomLink
        href={ROUTE_VIEW_USER.replace("[address]", vote.userAddress)}
        target="_blank"
        className="font-bold normal-case text-neutral-11 no-underline hover:underline"
      >
        {profileName}
      </CustomLink>
      <span>backed</span>
      <span className={`text-neutral-11 ${TICKER_ENTRY_TITLE_CLASS_NAME}`}>
        {entryTitle ?? TICKER_UNKNOWN_ENTRY_LABEL}
      </span>
      <span className="tabular-nums">
        · {spendText} · {formatTimeAgo(vote.createdAt, now)}
      </span>
    </span>
  );
};

export default TickerEvent;
