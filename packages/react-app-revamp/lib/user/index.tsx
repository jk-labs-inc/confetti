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
  try {
    const executeQuery = async (useIlike: boolean) => {
      let dataQuery;
      let countQuery;

      const baseQuery = (query: any) => {
        if (useIlike) {
          return query.ilike("user_address", criteria.user_address);
        } else {
          return query.eq("user_address", criteria.user_address);
        }
      };

      if (criteria.vote_amount === null) {
        dataQuery = baseQuery(
          supabase
            .from("analytics_contest_participants_v3")
            .select("network_name, contest_address, proposal_id, created_at"),
        )
          .is("vote_amount", criteria.vote_amount)
          .is("comment_id", null)
          .order("created_at", { ascending: false })
          .range(range.from, range.to);

        countQuery = baseQuery(
          supabase.from("analytics_contest_participants_v3").select("*", { count: "exact", head: true }),
        )
          .is("vote_amount", criteria.vote_amount)
          .is("comment_id", null);
      } else {
        dataQuery = baseQuery(
          supabase
            .from("analytics_contest_participants_v3")
            .select("network_name, contest_address, proposal_id, created_at, vote_amount"),
        )
          .not("vote_amount", "is", null)
          .order("created_at", { ascending: false })
          .range(range.from, range.to);

        countQuery = baseQuery(
          supabase.from("analytics_contest_participants_v3").select("*", { count: "exact", head: true }),
        ).not("vote_amount", "is", null);
      }

      const [dataResult, countResult] = await Promise.all([dataQuery, countQuery]);

      return { dataResult, countResult };
    };

    // first attempt with eq
    let { dataResult, countResult } = await executeQuery(false);

    // if no results, it could be that address is lowercase, try with ilike
    if (dataResult.data?.length === 0) {
      ({ dataResult, countResult } = await executeQuery(true));
    }

    if (dataResult.error) throw dataResult.error;
    if (countResult.error) throw countResult.error;

    const data = dataResult.data || [];
    const count = countResult.count ?? 0;

    return { data, count };
  } catch (error) {
    throw error;
  }
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
