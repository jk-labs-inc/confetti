import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import shortenEthereumAddress from "@helpers/shortenEthereumAddress";
import { ROUTE_VIEW_USER } from "@config/routes";
import { FC } from "react";
import { useMediaQuery } from "react-responsive";
import CancelContest from "../CancelContest";
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
  const isContestCanceled = contestState === ContestStateEnum.Canceled;
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  if (isMobile) {
    return (
      <div className="flex items-center justify-between w-full">
        <p
          className={`text-[20px] md:text-[32px] text-neutral-11 font-bold ${isContestCanceled ? "line-through" : ""}`}
        >
          {contestName}
        </p>
        <div className="flex items-center gap-2">
          <EditContestName contestName={contestName} canEditTitle={canEditTitle} contestPrompt={contestPrompt} contestImageUrl={contestImageUrl} />
          <CancelContest />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-baseline relative w-full">
      <div className="absolute left-0 -translate-x-full -ml-4 flex items-center gap-2 top-1/2 -translate-y-1/2">
        <EditContestName contestName={contestName} canEditTitle={canEditTitle} contestPrompt={contestPrompt} contestImageUrl={contestImageUrl} />
        <CancelContest />
      </div>
      <div className="flex items-baseline gap-4">
        <p
          className={`text-neutral-11 font-sabo-filled ${contestName.length > 20 ? "text-[20px] md:text-[28px]" : "text-[20px] md:text-[32px]"} ${isContestCanceled ? "line-through" : ""}`}
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
              {shortenEthereumAddress(contestAuthorEthereumAddress)}
            </CustomLink>
          </p>
        )}
        <ContestShareButton contestName={contestName} contestAddress={contestAddress} chainName={chainName} />
      </div>
    </div>
  );
};

export default ContestName;
