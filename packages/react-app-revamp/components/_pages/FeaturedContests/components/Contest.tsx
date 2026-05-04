import CustomLink from "@components/UI/Link";
import ContestNotifyButton from "@components/_pages/Contest/components/ContestNotifyButton";
import { ROUTE_VIEW_CONTEST_BASE_PATH } from "@config/routes";
import { ContestWithTotalRewards, ProcessedContest } from "lib/contests/types";
import { FC, useEffect, useState } from "react";
import ContestCardContainer from "./Contest/components/Container";
import ContestRewards from "./Contest/components/ContestRewards";
import ContestState from "./Contest/components/ContestState";
import ContestTiming from "./Contest/components/ContestTiming";
import ContestTitle from "./Contest/components/ContestTitle";
import { getContestState, getContestTitleState, getUpdateInterval } from "./Contest/helpers";

interface FeaturedContestCardProps {
  contestData: ProcessedContest;
  rewardsData?: ContestWithTotalRewards | null;
  isRewardsFetching: boolean;
}

const FeaturedContestCard: FC<FeaturedContestCardProps> = ({ contestData, rewardsData, isRewardsFetching }) => {
  const [contestState, setContestState] = useState(getContestState(contestData));
  const [titleState, setTitleState] = useState(getContestTitleState(contestData));

  useEffect(() => {
    const updateStatus = () => {
      setContestState(getContestState(contestData));
      setTitleState(getContestTitleState(contestData));
    };

    updateStatus();

    const intervalTime = getUpdateInterval(contestData);
    const interval = setInterval(() => {
      updateStatus();
    }, intervalTime);

    return () => clearInterval(interval);
  }, [contestData]);

  const getContestUrl = (network_name: string, address: string) => {
    return ROUTE_VIEW_CONTEST_BASE_PATH.replace("[chain]", network_name).replace("[address]", address);
  };

  const votesOpen = new Date(contestData.vote_start_at);
  const votesClose = new Date(contestData.end_at);
  const showNotify = votesOpen > new Date();

  return (
    <div className="relative animate-appear">
      <CustomLink
        className="flex flex-col gap-2"
        prefetch={true}
        href={getContestUrl(contestData.network_name ?? "", contestData.address ?? "")}
      >
        <ContestCardContainer prompt={contestData.prompt}>
          <ContestState state={contestState} />
          <ContestTitle title={contestData.title} state={titleState} />
        </ContestCardContainer>
        <div className="px-4 flex items-center gap-24 md:gap-4">
          <div className="min-w-28 max-w-full shrink-0">
            <ContestTiming contest={contestData} />
          </div>
          <ContestRewards contestData={contestData} rewardsData={rewardsData} isRewardsFetching={isRewardsFetching} />
        </div>
      </CustomLink>
      {showNotify && (
        <ContestNotifyButton
          contestName={contestData.title}
          contestAddress={contestData.address}
          chainName={contestData.network_name}
          votesOpen={votesOpen}
          votesClose={votesClose}
          size="sm"
          className="absolute top-2 right-2 z-10 transition-[box-shadow,filter] duration-200 hover:brightness-110 hover:shadow-[0_0_14px_rgba(187,101,255,0.7),0_0_6px_rgba(102,222,255,0.5)]"
        />
      )}
    </div>
  );
};

export default FeaturedContestCard;
