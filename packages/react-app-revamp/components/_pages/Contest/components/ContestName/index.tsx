import ContestImage from "@components/_pages/Contest/components/ContestImage";
import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import useProfileData from "@hooks/useProfileData";
import { ROUTE_VIEW_USER } from "@config/routes";
import { FC } from "react";
import { useMediaQuery } from "react-responsive";
import CancelContest from "../CancelContest";
import EditContestName from "./components/EditContestName";
import CustomLink from "@components/UI/Link";

interface ContestNameProps {
  contestName: string;
  canEditTitle: boolean;
  contestAuthorEthereumAddress?: string;
  contestPrompt?: string;
  contestImageUrl?: string;
}

const TITLE_MAX_FONT_PX = 32;
const TITLE_MIN_FONT_PX = 18;
const TITLE_SHORT_LEN = 20;
const TITLE_LONG_LEN = 40;

const computeDesktopTitleSize = (length: number) => {
  if (length <= TITLE_SHORT_LEN) return TITLE_MAX_FONT_PX;
  if (length >= TITLE_LONG_LEN) return TITLE_MIN_FONT_PX;
  const ratio = (length - TITLE_SHORT_LEN) / (TITLE_LONG_LEN - TITLE_SHORT_LEN);
  return Math.round(TITLE_MAX_FONT_PX - ratio * (TITLE_MAX_FONT_PX - TITLE_MIN_FONT_PX));
};

const ContestName: FC<ContestNameProps> = ({
  contestName,
  canEditTitle,
  contestAuthorEthereumAddress,
  contestPrompt,
  contestImageUrl,
}) => {
  const { contestState } = useContestStateStore(state => state);
  const isContestCanceled = contestState === ContestStateEnum.Canceled;
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const { profileName: contestAuthorProfileName } = useProfileData(contestAuthorEthereumAddress ?? "", true);

  if (isMobile) {
    return (
      <div className="flex items-center justify-between w-full">
        <p
          className={`text-[20px] md:text-[32px] text-neutral-11 font-bold ${isContestCanceled ? "line-through" : ""}`}
        >
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
  }

  return (
    <div className="flex items-center relative w-full">
      <div className="absolute left-0 -translate-x-full -ml-4 flex items-center gap-2 top-1/2 -translate-y-1/2">
        <CancelContest />
        <EditContestName
          contestName={contestName}
          canEditTitle={canEditTitle}
          contestPrompt={contestPrompt}
          contestImageUrl={contestImageUrl}
        />
      </div>
      <div className="flex items-baseline gap-3 w-full min-w-0">
        {contestImageUrl && <ContestImage imageUrl={contestImageUrl} />}
        <p
          className={`text-neutral-11 font-sabo-filled truncate ${isContestCanceled ? "line-through" : ""}`}
          style={{ fontSize: `${computeDesktopTitleSize(contestName.length)}px` }}
        >
          {contestName}
        </p>
        {contestAuthorEthereumAddress && (
          <p className="text-[14px] whitespace-nowrap shrink-0">
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
    </div>
  );
};

export default ContestName;
