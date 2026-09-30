import { ContestStatus } from "@hooks/useContestStatus/store";

export const GHOST_SEAT_LABEL = "open seat";

interface EmptyCopy {
  title: string;
  hint: string;
}

export const EMPTY_ACTIVITY_COPY: Record<ContestStatus, EmptyCopy> = {
  [ContestStatus.ContestOpen]: { title: "no votes yet", hint: "votes stream in here live once voting opens" },
  [ContestStatus.SubmissionOpen]: { title: "no votes yet", hint: "votes stream in here live once voting opens" },
  [ContestStatus.VotingOpen]: { title: "no votes yet", hint: "be the first — the price per vote only goes up" },
  [ContestStatus.VotingClosed]: { title: "no votes were cast", hint: "voting closed without any activity" },
};

export const EMPTY_LEADERBOARD_COPY: Record<ContestStatus, EmptyCopy> = {
  [ContestStatus.ContestOpen]: { title: "no voters yet", hint: "top voters by payout show up here" },
  [ContestStatus.SubmissionOpen]: { title: "no voters yet", hint: "top voters by payout show up here" },
  [ContestStatus.VotingOpen]: { title: "the podium is empty", hint: "back the right entry early to top the board" },
  [ContestStatus.VotingClosed]: { title: "no voters", hint: "nobody voted in this contest" },
};
