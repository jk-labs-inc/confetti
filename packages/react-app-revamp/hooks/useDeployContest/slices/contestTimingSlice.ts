import moment from "moment-timezone";
import { TimingDetails, createDateFromTiming, convertDateToTimingDetails } from "./helpers/dateHelpers";
import {
  generateVotingOpenMonthOptions,
  generateVotingOpenDayOptions,
  HOUR_OPTIONS,
  DURATION_OPTIONS,
} from "./helpers/optionGenerators";

export enum Period {
  AM = "AM",
  PM = "PM",
}

export interface TimingOption {
  label: string;
  value: string;
}

export interface ContestTimingSliceState {
  submissionOpen: Date;
  votingOpen: TimingDetails;
  votingDuration: number;
}

export interface ContestTimingSliceActions {
  setSubmissionOpen: (submissionOpen: Date) => void;
  updateVotingOpen: (updates: Partial<TimingDetails>) => void;
  setVotingOpen: (date: Date) => void;
  setVotingDuration: (hours: number) => void;
  getVotingOpenDate: () => Date;
  getVotingCloseDate: () => Date;
  getVotingOpenMonthOptions: () => TimingOption[];
  getVotingOpenDayOptions: () => TimingOption[];
  getVotingOpenHourOptions: () => TimingOption[];
  getDurationOptions: () => TimingOption[];
  validateTiming: () => { isValid: boolean; error: string | null };
}

export type ContestTimingSlice = ContestTimingSliceState & ContestTimingSliceActions;

export const createContestTimingSlice = (set: any, get: any): ContestTimingSlice => {
  const initialSubmissionOpen: Date = moment().toDate();

  // Voting opens defaults to 1 week from now at 12:00pm ET
  const initialVotingOpenDate = moment
    .tz("America/New_York")
    .add(7, "days")
    .hour(12)
    .minute(0)
    .second(0)
    .millisecond(0)
    .local();

  const initialVotingOpen: TimingDetails = convertDateToTimingDetails(initialVotingOpenDate.toDate());

  return {
    submissionOpen: initialSubmissionOpen,
    votingOpen: initialVotingOpen,
    votingDuration: 2,

    setSubmissionOpen: (submissionOpen: Date) => set({ submissionOpen }),

    updateVotingOpen: (updates: Partial<TimingDetails>) => {
      const state = get();
      const newVotingOpen = { ...state.votingOpen, ...updates };

      // If month changed, validate the day is still available
      if (updates.month !== undefined && updates.month !== state.votingOpen.month) {
        const availableDays = generateVotingOpenDayOptions(updates.month);
        const currentDayIsValid = availableDays.some(d => parseInt(d.value) === newVotingOpen.day);

        if (!currentDayIsValid && availableDays.length > 0) {
          newVotingOpen.day = parseInt(availableDays[0].value);
        }
      }

      set({ votingOpen: newVotingOpen });
    },

    setVotingOpen: (date: Date) => {
      const timingDetails = convertDateToTimingDetails(date);
      set({ votingOpen: timingDetails });
    },

    setVotingDuration: (hours: number) => {
      set({ votingDuration: hours });
    },

    getVotingOpenDate: () => {
      const state = get();
      return createDateFromTiming(state.votingOpen);
    },

    getVotingCloseDate: () => {
      const state = get();
      const votingOpenDate = createDateFromTiming(state.votingOpen);
      return new Date(votingOpenDate.getTime() + state.votingDuration * 3600000);
    },

    getVotingOpenMonthOptions: () => generateVotingOpenMonthOptions(),

    getVotingOpenDayOptions: () => {
      const state = get();
      return generateVotingOpenDayOptions(state.votingOpen.month);
    },

    getVotingOpenHourOptions: () => HOUR_OPTIONS,

    getDurationOptions: () => DURATION_OPTIONS,

    validateTiming: () => {
      const state = get();
      const votingOpenDate = createDateFromTiming(state.votingOpen);
      const now = new Date();

      if (votingOpenDate <= now) {
        return {
          isValid: false,
          error: "Voting open time must be in the future",
        };
      }

      return { isValid: true, error: null };
    },
  };
};
