"use client";

import FeaturedContests from "@components/_pages/FeaturedContests";
import CustomLink from "@components/UI/Link";
import { ROUTE_VIEW_LIVE_CONTESTS } from "@config/routes";
import { isSupabaseConfigured } from "@helpers/database";
import { experimental_streamedQuery as streamedQuery, useQuery } from "@tanstack/react-query";
import { streamFeaturedContests } from "lib/contests";
import { CONTESTS_FEATURE_COUNT } from "lib/contests/constants";
import { fetchTotalRewardsForContests } from "lib/contests/contracts";
import { ProcessedContest } from "lib/contests/types";
import moment from "moment";
import { useCallback, useState } from "react";
import LandingPageHowItWorks from "./HowItWorks";

const sortContests = (contests: ProcessedContest[]): ProcessedContest[] => {
  const now = moment();

  return [...contests].sort((a, b) => {
    const aEnd = moment(a.end_at);
    const bEnd = moment(b.end_at);
    const aVoteStart = moment(a.vote_start_at);
    const bVoteStart = moment(b.vote_start_at);

    const aIsEnded = aEnd.isSameOrBefore(now);
    const bIsEnded = bEnd.isSameOrBefore(now);

    if (!aIsEnded && bIsEnded) return -1;
    if (aIsEnded && !bIsEnded) return 1;

    if (!aIsEnded && !bIsEnded) {
      const startDiff = aVoteStart.diff(bVoteStart);
      if (startDiff !== 0) return startDiff;
      return aEnd.diff(bEnd);
    }

    const endDiff = bEnd.diff(aEnd);
    if (endDiff !== 0) return endDiff;
    return bVoteStart.diff(aVoteStart);
  });
};

function useFeaturedContests() {
  const [page] = useState(0);
  const selectSortedContests = useCallback((data: ProcessedContest[]) => sortContests(data), []);

  const {
    data: contestData = [],
    status,
    isFetching: isContestDataFetching,
  } = useQuery({
    queryKey: ["featuredContestsStream", page],
    //TODO: test this streamedQuery from useQuery, let's see if this feature can replace our manual (still experimental but looks promising)
    queryFn: streamedQuery({
      streamFn: () => streamFeaturedContests(page, CONTESTS_FEATURE_COUNT),
      refetchMode: "reset",
    }),
    select: selectSortedContests,
    refetchOnWindowFocus: false,
  });

  const isStreamingComplete = status === "success" && !isContestDataFetching;

  const { data: rewardsData, isFetching: isRewardsFetching } = useQuery({
    queryKey: ["totalRewards", isStreamingComplete ? contestData.length : "pending"],
    queryFn: () => fetchTotalRewardsForContests(contestData),
    enabled: isStreamingComplete && contestData.length > 0,
    refetchOnWindowFocus: false,
  });

  return {
    status,
    contestData,
    rewardsData,
    isRewardsFetching,
    isContestDataFetching,
  };
}

const LandingPage = () => {
  const { status, contestData, rewardsData, isRewardsFetching, isContestDataFetching } = useFeaturedContests();

  return (
      <div className="flex flex-col gap-12 md:gap-20 pb-12 px-4 md:px-8 3xl:px-20 mt-6 lx:mt-12">
          {isSupabaseConfigured ? (
            <div className="flex flex-col gap-8 w-full lx:w-fit">
              <FeaturedContests
                status={status}
                contestData={contestData}
                rewardsData={rewardsData}
                isRewardsFetching={isRewardsFetching}
                isContestDataFetching={isContestDataFetching}
              />
              <CustomLink
                prefetch={true}
                href={ROUTE_VIEW_LIVE_CONTESTS}
                className="ml-auto bg-positive-18 text-base text-true-black font-bold px-4 h-10 hidden md:flex items-center justify-center rounded-2xl transition-all duration-200 ease-out hover:brightness-110 hover:shadow-[0_0_12px_rgba(255,255,255,0.15)]"
              >
                play in contests and earn
              </CustomLink>
            </div>
          ) : (
            <div className="border-neutral-4 animate-appear p-3 rounded-md border-solid border mb-5 text-sm font-bold">
              This site&apos;s current deployment does not have access to Confetti&apos;s reference database of
              contests, but you can check out our Supabase backups{" "}
              <a
                className="link px-1ex"
                href="https://github.com/jk-labs-inc/confetti/tree/staging/packages/supabase"
                target="_blank"
                rel="noreferrer"
              >
                here
              </a>{" "}
              for contest chain and address information!
            </div>
          )}
          <LandingPageHowItWorks />
    </div>
  );
};

export default LandingPage;
