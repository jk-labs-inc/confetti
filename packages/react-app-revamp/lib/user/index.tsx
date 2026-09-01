import { supabase } from "@config/supabase";
import getPagination from "@helpers/getPagination";
import { getContestContractData } from "lib/contests/contracts";
import { Contest, Submission, SubmissionCriteria, SubmissionsResult } from "./types";

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

async function fetchSubmissions(
  criteria: SubmissionCriteria,
  range: { from: number; to: number },
): Promise<{ data: any[]; count: number }> {
  const isEntries = criteria.vote_amount === null;
  const columns = isEntries
    ? "network_name, contest_address, proposal_id, proposal_name, created_at"
    : "network_name, contest_address, proposal_id, proposal_name, created_at, vote_amount";

  const applyFilters = (query: any) => {
    const scoped = query.ilike("user_address", criteria.user_address);
    return isEntries ? scoped.is("vote_amount", null).is("comment_id", null) : scoped.not("vote_amount", "is", null);
  };

  const [dataResult, countResult] = await Promise.all([
    applyFilters(supabase.from("analytics_contest_participants_v3").select(columns))
      .order("created_at", { ascending: false, nullsFirst: false })
      .order("uuid", { ascending: false })
      .range(range.from, range.to),
    applyFilters(supabase.from("analytics_contest_participants_v3").select("*", { count: "exact", head: true })),
  ]);

  if (dataResult.error) throw dataResult.error;
  if (countResult.error) throw countResult.error;

  return { data: dataResult.data ?? [], count: countResult.count ?? 0 };
}

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
  const range = getPagination(currentPage, itemsPerPage);
  const criteria: SubmissionCriteria = { user_address: userAddress, vote_amount: null };

  const { data: submissions, count } = await fetchSubmissions(criteria, range);

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
  const range = getPagination(currentPage, itemsPerPage);
  const criteria: SubmissionCriteria = { user_address: userAddress };
  criteria["vote_amount"] = { neq: null };

  const { data: submissions, count } = await fetchSubmissions(criteria, range);
  const contestsAddressesAndChains = submissions.map(s => ({
    address: s.contest_address,
    network_name: s.network_name,
  }));
  const contests = await getContestDetailsByAddresses(contestsAddressesAndChains);

  const mergedSubmissions = mergeSubmissionsWithContests(submissions, contests);

  return { data: mergedSubmissions, count };
}
