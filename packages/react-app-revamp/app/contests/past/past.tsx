"use client";
import ListContests from "@components/_pages/ListContests";
import { isSupabaseConfigured } from "@helpers/database";
import { useQuery } from "@tanstack/react-query";
import { getPastContests } from "lib/contests";
import { ITEMS_PER_PAGE } from "lib/contests/constants";
import { fetchTotalRewardsForContests } from "lib/contests/contracts";
import { useState } from "react";

function useContests() {
  const [page, setPage] = useState(0);

  const {
    status,
    data: contestData,
    error,
    isFetching: isContestDataFetching,
  } = useQuery({
    queryKey: ["pastContests", page],
    queryFn: () => getPastContests(page, ITEMS_PER_PAGE),
  });

  const { data: rewardsData, isFetching: isRewardsFetching } = useQuery({
    queryKey: ["rewards", contestData],
    queryFn: () => fetchTotalRewardsForContests(contestData?.data ?? []),
    enabled: !!contestData,
  });

  return {
    page,
    setPage,
    status,
    contestData,
    rewardsData,
    isRewardsFetching,
    error,
    isContestDataFetching,
  };
}
const PastContests = () => {
  const { page, setPage, status, contestData, rewardsData, error, isContestDataFetching, isRewardsFetching } =
    useContests();

  return (
    <div className="container mx-auto pt-10">
      <h1 className="sr-only">Past contests</h1>
      {isSupabaseConfigured ? (
        <ListContests
          isContestDataFetching={isContestDataFetching}
          isRewardsFetching={isRewardsFetching}
          itemsPerPage={ITEMS_PER_PAGE}
          status={status}
          error={error}
          page={page}
          setPage={setPage}
          contestData={contestData}
          rewardsData={rewardsData}
        />
      ) : (
        <div className="border-neutral-4 animate-appear p-3 rounded-md border-solid border mb-5 text-sm font-bold">
          This site&apos;s current deployment does not have access to Confetti&apos;s reference database of contests,
          but you can check out our Supabase backups{" "}
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
      )}{" "}
    </div>
  );
};

export default PastContests;
