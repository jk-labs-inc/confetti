import ContestImage from "@components/_pages/Contest/components/ContestImage";
import CustomLink from "@components/UI/Link";
import { ROUTE_VIEW_USER } from "@config/routes";
import { CONTEST_TERMINAL_MIN_WIDTH_PX, CONTEST_WIDE_MIN_WIDTH_PX } from "@hooks/useContestLayoutBand";
import { MOBILE_MAX_WIDTH_PX } from "@helpers/isMobileViewport";
import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import { useFitText } from "@hooks/useFitText";
import useProfileData from "@hooks/useProfileData";
import { FC, ReactNode, useRef } from "react";
import { useMediaQuery } from "react-responsive";
import CancelContest from "../CancelContest";
import EditContestName from "./components/EditContestName";

interface ContestNameProps {
  contestName: string;
  canEditTitle: boolean;
  contestAuthorEthereumAddress?: string;
  contestPrompt?: string;
  contestImageUrl?: string;
  titleLeading?: ReactNode;
  actionsPlacement?: ContestNameActionsPlacement;
}

type ContestNameActionsPlacement = "hanging" | "inline";

const ACTIONS_CLASS_NAME: Record<ContestNameActionsPlacement, string> = {
  hanging: "absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 -ml-4 flex items-center gap-2",
  inline: "flex shrink-0 items-center gap-2 self-center empty:hidden",
};

const TITLE_MIN_PX = 14;
const TITLE_MAX_PX = { desktop: 28, terminal: 30, wide: 36 };
const AUTHOR_FONT_PX = { desktop: 14, wide: 16 };
const AUTHOR_MAX_WIDTH_EM = 16;

const ContestNameDesktop: FC<ContestNameProps> = ({
  contestName,
  canEditTitle,
  contestAuthorEthereumAddress,
  contestPrompt,
  contestImageUrl,
  titleLeading,
  actionsPlacement = "hanging",
}) => {
  const isContestCanceled = useContestStateStore(state => state.contestState) === ContestStateEnum.Canceled;
  const { profileName: contestAuthorProfileName } = useProfileData(contestAuthorEthereumAddress ?? "", true);
  const isTerminal = useMediaQuery({ minWidth: CONTEST_TERMINAL_MIN_WIDTH_PX });
  const isWide = useMediaQuery({ minWidth: CONTEST_WIDE_MIN_WIDTH_PX });
  const titleMaxPx = isWide ? TITLE_MAX_PX.wide : isTerminal ? TITLE_MAX_PX.terminal : TITLE_MAX_PX.desktop;
  const authorFontPx = isWide ? AUTHOR_FONT_PX.wide : AUTHOR_FONT_PX.desktop;

  const titleRef = useRef<HTMLParagraphElement>(null);
  const titleFontSize = useFitText(titleRef, contestName, { min: TITLE_MIN_PX, max: titleMaxPx });

  const actions = (
    <div className={ACTIONS_CLASS_NAME[actionsPlacement]}>
      <CancelContest />
      <EditContestName
        contestName={contestName}
        canEditTitle={canEditTitle}
        contestPrompt={contestPrompt}
        contestImageUrl={contestImageUrl}
      />
    </div>
  );

  return (
    <div className="relative flex items-baseline gap-3 flex-auto min-w-0">
      {actionsPlacement === "hanging" && actions}
      {titleLeading}
      {actionsPlacement === "inline" && actions}
      {contestImageUrl && <ContestImage imageUrl={contestImageUrl} />}
      <p
        ref={titleRef}
        className={`text-neutral-11 font-sabo-filled min-w-0 truncate ${isContestCanceled ? "line-through" : ""}`}
        style={{ fontSize: `${titleFontSize}px`, transition: "font-size 200ms ease-out" }}
      >
        {contestName}
      </p>
      {contestAuthorEthereumAddress && (
        <p
          className="truncate shrink-0"
          style={{ fontSize: `${authorFontPx}px`, maxWidth: `${AUTHOR_MAX_WIDTH_EM}em` }}
        >
          <span className="text-neutral-11">by </span>
          <CustomLink
            className="text-positive-11 no-underline"
            href={ROUTE_VIEW_USER.replace("[address]", contestAuthorEthereumAddress)}
            target="_blank"
          >
            {contestAuthorProfileName}
          </CustomLink>
        </p>
      )}
    </div>
  );
};

const ContestNameMobile: FC<ContestNameProps> = ({ contestName, canEditTitle, contestPrompt, contestImageUrl }) => {
  const isContestCanceled = useContestStateStore(state => state.contestState) === ContestStateEnum.Canceled;

  return (
    <div className="flex items-center justify-between w-full">
      <p className={`text-[20px] md:text-[32px] text-neutral-11 font-bold ${isContestCanceled ? "line-through" : ""}`}>
        {contestName}
      </p>
      <div className="flex items-center gap-2">
        <EditContestName
          contestName={contestName}
          canEditTitle={canEditTitle}
          contestPrompt={contestPrompt}
          contestImageUrl={contestImageUrl}
        />
        <CancelContest />
      </div>
    </div>
  );
};

const ContestName: FC<ContestNameProps> = props => {
  const isMobile = useMediaQuery({ maxWidth: MOBILE_MAX_WIDTH_PX });

  return isMobile ? <ContestNameMobile {...props} /> : <ContestNameDesktop {...props} />;
};

export default ContestName;
