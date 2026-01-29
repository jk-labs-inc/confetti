"use client";
import UserSubmissions from "@components/_pages/User/components/SubmissionsList";
import { isSupabaseConfigured } from "@helpers/database";
import { useQuery } from "@tanstack/react-query";
import { ITEMS_PER_PAGE } from "lib/contests/constants";
import { getUserSubmissions } from "lib/user";
import { SubmissionsResult } from "lib/user/types";
import { useState } from "react";

function useUserSubmissions(userAddress: string) {
  const [page, setPage] = useState(0);

  const {
    data: userSubmissionsData,
    isError: isError,
    isFetching: isLoading,
  } = useQuery<SubmissionsResult>({
    queryKey: ["userSubmissions", userAddress, page],
    queryFn: () => {
      return getUserSubmissions(userAddress, page, ITEMS_PER_PAGE);
    },
    enabled: !!userAddress,
  });

  return {
    page,
    setPage,
    userSubmissionsData,
    isError,
    isLoading,
  };
}

const UserSubmissionsLayout = ({ address }: { address: string }) => {
  const { page, setPage, userSubmissionsData, isLoading, isError } = useUserSubmissions(address);

  return (
    <>
      {isSupabaseConfigured ? (
        <UserSubmissions
          submissions={userSubmissionsData}
          page={page}
          itemsPerPage={ITEMS_PER_PAGE}
          setPage={setPage}
          isError={isError}
          isLoading={isLoading}
        />
      ) : (
        <div className="container mx-auto border-neutral-4 animate-appear p-3 rounded-md border-solid border mb-5 text-sm font-bold">
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

export default UserSubmissionsLayout;
