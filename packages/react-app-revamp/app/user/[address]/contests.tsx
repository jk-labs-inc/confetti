"use client";
import ListContests from "@components/_pages/ListContests";
import { isSupabaseConfigured } from "@helpers/database";
import useContestSortOptions from "@hooks/useSortOptions";
import { useQuery } from "@tanstack/react-query";
import { getUserContests } from "lib/contests";
import { ITEMS_PER_PAGE } from "lib/contests/constants";
import { fetchTotalRewardsForContests } from "lib/contests/contracts";
import { useState } from "react";

function useContests(profileAddress: string, sortBy?: string) {
  const [page, setPage] = useState(0);

  const {
    status,
    data: contestData,
    error,
    isFetching: isContestDataFetching,
  } = useQuery({
    queryKey: ["userContests", profileAddress, page, sortBy],
    queryFn: () => getUserContests(page, ITEMS_PER_PAGE, profileAddress, sortBy),
    enabled: !!profileAddress,
  });

  const {
    status: rewardsStatus,
    data: rewardsData,
    error: rewardsError,
    isFetching: isRewardsFetching,
  } = useQuery({
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

const UserContests = ({ address }: { address: string }) => {
  const [sortBy, setSortBy] = useState<string>("");
  const sortOptions = useContestSortOptions("liveContests");
  const { page, setPage, status, contestData, rewardsData, isRewardsFetching, error, isContestDataFetching } =
    useContests(address, sortBy);

  return (
    <>
      {isSupabaseConfigured ? (
        <div className="container mx-auto mt-4">
          <ListContests
            isContestDataFetching={isContestDataFetching}
            itemsPerPage={ITEMS_PER_PAGE}
            status={status}
            error={error}
            page={page}
            setPage={setPage}
            contestData={contestData}
            rewardsData={rewardsData}
            isRewardsFetching={isRewardsFetching}
            onSortChange={setSortBy}
            sortOptions={sortOptions}
          />
        </div>
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
      )}
    </>
  );
};

export default UserContests;
