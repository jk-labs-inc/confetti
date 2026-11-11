import { getJson } from "@helpers/fetchJson";
import { getContestContractData } from "lib/contests/contracts";
import type { UserActivityPage, UserActivityQuery } from "lib/supabase/types";
import { Contest, Submission, SubmissionsResult } from "./types";

function mergeSubmissionsWithContests(submissions: Submission[], contests: Contest[]): SubmissionsResult["data"] {
  const validsubmissions = submissions.filter(submission =>
    contests.some(contest => contest.address === submission.contest_address),
  );

  const results = validsubmissions.map(submission => {
    const matchedContest = contests.find(contest => contest.address === submission.contest_address)!;
    return {
      ...submission,
      contest: matchedContest,
    };
  });

  return results;
}

const fetchSubmissions = (query: UserActivityQuery) => getJson<UserActivityPage>("/api/participants", query);

async function getContestDetailsByAddresses(contests: { address: string; network_name: string }[]) {
  try {
    const contestDetails = await Promise.all(
      contests.map(async contest => {
        const { title } = await getContestContractData(contest.address, contest.network_name);
        return {
          address: contest.address,
          title: title ?? "",
        };
      }),
    );

    return contestDetails;
  } catch (error) {
    console.error("error fetching contest details:", error);
    throw error;
  }
}

export async function getUserSubmissions(
  userAddress: string,
  currentPage: number,
  itemsPerPage: number,
): Promise<SubmissionsResult> {
  const { data: submissions, count } = await fetchSubmissions({
    user: userAddress,
    kind: "entries",
    page: currentPage,
    perPage: itemsPerPage,
  });

  const contestsAddressesAndChains = submissions.map(p => ({
    address: p.contest_address,
    network_name: p.network_name,
  }));

  const contests = await getContestDetailsByAddresses(contestsAddressesAndChains);

  const mergedSubmissions = mergeSubmissionsWithContests(submissions, contests);

  return { data: mergedSubmissions, count };
}

export async function getUserVotes(
  userAddress: string,
  currentPage: number,
  itemsPerPage: number,
): Promise<SubmissionsResult> {
  const { data: submissions, count } = await fetchSubmissions({
    user: userAddress,
    kind: "votes",
    page: currentPage,
    perPage: itemsPerPage,
  });
  const contestsAddressesAndChains = submissions.map(s => ({
    address: s.contest_address,
    network_name: s.network_name,
  }));
  const contests = await getContestDetailsByAddresses(contestsAddressesAndChains);

  const mergedSubmissions = mergeSubmissionsWithContests(submissions, contests);

  return { data: mergedSubmissions, count };
}
