export interface SubmissionCriteria {
  user_address: string;
  [key: string]: any;
}

export interface Submission {
  contest_address: string;
  created_at: number;
  network_name: string;
  proposal_id: string;
  vote_amount?: number;
}

export interface Contest {
  title: string;
  address: string;
}

export type SubmissionWithContest = Submission & { contest: Contest };

export interface SubmissionsResult {
  data: Array<Submission & { contest: Contest }>;
  count: number;
}
