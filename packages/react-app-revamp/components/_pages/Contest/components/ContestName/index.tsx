import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import { useContestStore } from "@hooks/useContest/store";
import useProfileData from "@hooks/useProfileData";
import { ROUTE_VIEW_USER } from "@config/routes";
import { FC } from "react";
import { useMediaQuery } from "react-responsive";
import { useShallow } from "zustand/shallow";
import CancelContest from "../CancelContest";
import ContestNotifyButton from "../ContestNotifyButton";
import ContestShareButton from "../ContestShareButton";
import EditContestName from "./components/EditContestName";
import CustomLink from "@components/UI/Link";

interface ContestNameProps {
  contestAddress: string;
  chainName: string;
  contestName: string;
  canEditTitle: boolean;
  contestAuthorEthereumAddress?: string;
  contestPrompt?: string;
  contestImageUrl?: string;
}

const ContestName: FC<ContestNameProps> = ({
  contestName,
  contestAddress,
  chainName,
  canEditTitle,
  contestAuthorEthereumAddress,
  contestPrompt,
  contestImageUrl,
}) => {
  const { contestState } = useContestStateStore(state => state);
  const { votesOpen, votesClose } = useContestStore(useShallow(state => ({ votesOpen: state.votesOpen, votesClose: state.votesClose })));
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
    <div className="flex items-baseline relative w-full">
      <div className="absolute left-0 -translate-x-full -ml-4 flex items-center gap-2 top-1/2 -translate-y-1/2">
        <EditContestName
          contestName={contestName}
          canEditTitle={canEditTitle}
          contestPrompt={contestPrompt}
          contestImageUrl={contestImageUrl}
        />
        <CancelContest />
      </div>
      <div className="flex items-baseline gap-4 w-full">
        <p
          className={`text-neutral-11 font-sabo-filled ${contestName.length > 20 ? "text-[20px] md:text-[24px]" : "text-[20px] md:text-[32px]"} ${isContestCanceled ? "line-through" : ""}`}
        >
          {contestName}
        </p>
        {contestAuthorEthereumAddress && (
          <p className="text-[16px] whitespace-nowrap">
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
        <div className="ml-auto flex items-center gap-3">
          <ContestShareButton contestName={contestName} contestAddress={contestAddress} chainName={chainName} />
          <ContestNotifyButton
            contestName={contestName}
            contestAddress={contestAddress}
            chainName={chainName}
            votesOpen={votesOpen}
            votesClose={votesClose}
          />
        </div>
      </div>
    </div>
  );
};

export default ContestName;
