export type ContestClockStage =
  | { stage: "canceled" }
  | { stage: "upcoming"; countdown: string }
  | { stage: "live"; countdown: string }
  | { stage: "ended"; endedOn: string };
