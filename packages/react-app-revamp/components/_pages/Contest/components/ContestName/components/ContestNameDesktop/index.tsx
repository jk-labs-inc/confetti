import CancelContest from "@components/_pages/Contest/components/CancelContest";
import ContestImage from "@components/_pages/Contest/components/ContestImage";
import { Avatar } from "@components/UI/Avatar";
import CustomLink from "@components/UI/Link";
import { ROUTE_VIEW_USER } from "@config/routes";
import { CONTEST_TERMINAL_MIN_WIDTH_PX, CONTEST_WIDE_MIN_WIDTH_PX } from "@hooks/useContestLayoutBand";
import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import { useFitText } from "@hooks/useFitText";
import useProfileData from "@hooks/useProfileData";
import { FC, useRef } from "react";
import { useMediaQuery } from "react-responsive";
import type { ContestNameProps } from "../../types";
import EditContestName from "../EditContestName";

const TITLE_MIN_PX = 14;
const TITLE_MAX_PX = { desktop: 28, terminal: 30, wide: 36 };
const META_FONT_PX = { desktop: 14, wide: 15 };
const AUTHOR_AVATAR_PX = 20;
const AUTHOR_MAX_WIDTH_EM = 16;

const ContestNameDesktop: FC<ContestNameProps> = ({
  contestName,
  canEditTitle,
  contestAuthorEthereumAddress,
  contestPrompt,
  contestImageUrl,
  titleTrailing,
  metaActions,
}) => {
  const isContestCanceled = useContestStateStore(state => state.contestState) === ContestStateEnum.Canceled;
  const { profileName: contestAuthorProfileName, profileAvatar: contestAuthorProfileAvatar } = useProfileData(
    contestAuthorEthereumAddress ?? "",
    true,
  );
  const isTerminal = useMediaQuery({ minWidth: CONTEST_TERMINAL_MIN_WIDTH_PX });
  const isWide = useMediaQuery({ minWidth: CONTEST_WIDE_MIN_WIDTH_PX });
  const titleMaxPx = isWide ? TITLE_MAX_PX.wide : isTerminal ? TITLE_MAX_PX.terminal : TITLE_MAX_PX.desktop;
  const metaFontPx = isWide ? META_FONT_PX.wide : META_FONT_PX.desktop;

  const titleRef = useRef<HTMLParagraphElement>(null);
  const titleFontSize = useFitText(titleRef, contestName, { min: TITLE_MIN_PX, max: titleMaxPx });

  return (
    <div className="flex min-w-0 flex-auto flex-col gap-2">
      <div className="flex min-w-0 items-center gap-2">
        {contestImageUrl && <ContestImage imageUrl={contestImageUrl} />}
        <div className="flex min-w-0 flex-auto items-center gap-2">
          <p
            ref={titleRef}
            className={`text-neutral-11 font-sabo-filled min-w-0 truncate ${isContestCanceled ? "line-through" : ""}`}
            style={{ fontSize: `${titleFontSize}px`, transition: "font-size 200ms ease-out" }}
          >
            {contestName}
          </p>
          {titleTrailing}
        </div>
      </div>
      <div
        className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 whitespace-nowrap"
        style={{ fontSize: `${metaFontPx}px` }}
      >
        {contestAuthorEthereumAddress && (
          <>
            <div className="flex min-w-0 items-center gap-2">
              <Avatar
                src={contestAuthorProfileAvatar}
                address={contestAuthorEthereumAddress}
                sizePx={AUTHOR_AVATAR_PX}
                className="shrink-0"
              />
              <p className="min-w-0 truncate" style={{ maxWidth: `${AUTHOR_MAX_WIDTH_EM}em` }}>
                <span className="text-neutral-12">by </span>
                <CustomLink
                  className="text-positive-11 no-underline"
                  href={ROUTE_VIEW_USER.replace("[address]", contestAuthorEthereumAddress)}
                  target="_blank"
                >
                  {contestAuthorProfileName}
                </CustomLink>
              </p>
            </div>
            <span aria-hidden="true" className="h-3.5 w-px shrink-0 bg-neutral-10" />
          </>
        )}
        {metaActions}
        <EditContestName
          contestName={contestName}
          canEditTitle={canEditTitle}
          contestPrompt={contestPrompt}
          contestImageUrl={contestImageUrl}
          variant="link"
        />
        <CancelContest variant="link" />
      </div>
    </div>
  );
};

export default ContestNameDesktop;
