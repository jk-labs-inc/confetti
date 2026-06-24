import ContestImage from "@components/_pages/Contest/components/ContestImage";
import CustomLink from "@components/UI/Link";
import { ROUTE_VIEW_USER } from "@config/routes";
import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import { useContestStickyStore } from "@hooks/useContestStickyStore";
import { useFitText } from "@hooks/useFitText";
import useProfileData from "@hooks/useProfileData";
import { FC, useRef } from "react";
import { useMediaQuery } from "react-responsive";
import CancelContest from "../CancelContest";
import EditContestName from "./components/EditContestName";

interface ContestNameProps {
  contestName: string;
  canEditTitle: boolean;
  contestAuthorEthereumAddress?: string;
  contestPrompt?: string;
  contestImageUrl?: string;
}

const TITLE_SIZE = { min: 14, max: 32 };
const TITLE_SIZE_COMPACT = { min: 11, max: 24 };
const AUTHOR_FONT_PX = 14;
const AUTHOR_COMPACT_FONT_PX = 12;

const ContestNameDesktop: FC<ContestNameProps> = ({
  contestName,
  canEditTitle,
  contestAuthorEthereumAddress,
  contestPrompt,
  contestImageUrl,
}) => {
  const isContestCanceled = useContestStateStore(state => state.contestState) === ContestStateEnum.Canceled;
  const { profileName: contestAuthorProfileName } = useProfileData(contestAuthorEthereumAddress ?? "", true);
  const isCompact = useContestStickyStore(state => state.isCompact);

  const titleRef = useRef<HTMLParagraphElement>(null);
  const titleFontSize = useFitText(titleRef, contestName, isCompact ? TITLE_SIZE_COMPACT : TITLE_SIZE);

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
          ref={titleRef}
          className={`text-neutral-11 font-sabo-filled min-w-0 truncate ${isContestCanceled ? "line-through" : ""}`}
          style={{ fontSize: `${titleFontSize}px`, transition: "font-size 200ms ease-out" }}
        >
          {contestName}
        </p>
        {contestAuthorEthereumAddress && (
          <p
            className="whitespace-nowrap shrink-0"
            style={{
              fontSize: `${isCompact ? AUTHOR_COMPACT_FONT_PX : AUTHOR_FONT_PX}px`,
              transition: "font-size 200ms ease-out",
            }}
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
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  return isMobile ? <ContestNameMobile {...props} /> : <ContestNameDesktop {...props} />;
};

export default ContestName;
