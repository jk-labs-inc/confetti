"use client";
import ListContests from "@components/_pages/ListContests";
import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import { SearchBar } from "@components/_pages/SearchBar";
import { isSupabaseConfigured } from "@helpers/database";
import useContestSortOptions from "@hooks/useSortOptions";
import { useQuery } from "@tanstack/react-query";
import { getEnsAddress } from "@wagmi/core";
import { searchContests } from "lib/contests";
import { ITEMS_PER_PAGE } from "lib/contests/constants";
import { fetchTotalRewardsForContests } from "lib/contests/contracts";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type SearchCriteria = {
  searchString: string;
  searchColumn: string;
};

function useContests(searchCriteria: SearchCriteria, sortBy?: string) {
  const [page, setPage] = useState(0);

  const {
    status,
    data: contestData,
    error,
    isFetching: isContestDataFetching,
  } = useQuery({
    queryKey: ["searchedContests", searchCriteria.searchString, page, sortBy],
    queryFn: () => {
      return searchContests(
        {
          searchString: searchCriteria.searchString,
          searchColumn: searchCriteria.searchColumn,
          pagination: {
            currentPage: page,
          },
        },
        sortBy,
      );
    },
    enabled: searchCriteria.searchString !== "",
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

const SearchContests = () => {
  const router = useRouter();
  const query = useSearchParams();
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    searchString: "",
    searchColumn: "title",
  });
  const [sortBy, setSortBy] = useState<string>("");
  const sortOptions = useContestSortOptions("liveContests");
  const { page, setPage, status, contestData, rewardsData, error, isContestDataFetching, isRewardsFetching } =
    useContests(searchCriteria, sortBy);

  useEffect(() => {
    if (query?.has("title") && query?.has("sortBy")) {
      setSearchCriteria({
        searchString: query.get("title") ?? "",
        searchColumn: "title",
      });

      setSortBy(query.get("sortBy") ?? "");
    }
  }, [query]);

  const handleSearch = async (criteria: { query: string; filterType: string }) => {
    if (criteria.filterType === "user") {
      let targetAddress = criteria.query;

      if (criteria.query.endsWith(".eth")) {
        try {
          const resolvedAddress = await getEnsAddress(getWagmiConfig(), { name: criteria.query, chainId: 1 });
          targetAddress = resolvedAddress || criteria.query;
        } catch (error) {
          return;
        }
      }

      router.push(`/user/${targetAddress}`);
    } else {
      setSearchCriteria({
        searchString: criteria.query,
        searchColumn: criteria.filterType,
      });
    }
  };

  const adjustPaddingForInline = searchCriteria.searchString.length > 0 ? "p-3" : "p-20";

  return (
    <div>
      <div className={`container mx-auto ${adjustPaddingForInline}`}>
        {!searchCriteria.searchString.length && (
          <h1 className="text-[16px] sm:text-[28px] font-sabo-filled text-neutral-11 font-bold mb-4 text-center">
            Search contests
          </h1>
        )}

        <SearchBar isInline={searchCriteria.searchString.length ? true : false} onSearch={handleSearch} />
      </div>

      {searchCriteria.searchString.length > 0 && (
        <div className="container mx-auto">
          <h1 className="sr-only">Searched contests</h1>
          {isSupabaseConfigured ? (
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
        </div>
      )}
    </div>
  );
};

export default SearchContests;
