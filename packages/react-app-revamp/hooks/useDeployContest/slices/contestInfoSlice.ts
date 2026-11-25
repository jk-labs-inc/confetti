import { EMPTY_PHONE_NUMBER } from "lib/phone/constants";
import { PhoneNumberValue } from "lib/phone/types";

const DEFAULT_EVALUATE_VOTERS =
  'Voters should evaluate based on whichever option they think will make the most <a href="https://docs.confetti.win/calculating-roi" target="_blank">money</a> 😈';
const DEFAULT_CONTACT_DETAILS =
  '<p>join the Confetti telegram: https://t.me/+rW5X0MqnTXBkOGIx</p><p>follow <a href="https://x.com/confetti_win" target="_blank">@Confetti_win</a></p>';

export type Prompt = {
  summarize: string;
  evaluateVoters: string;
  contactDetails?: string;
  imageUrl?: string;
  imageFileName?: string;
};

export interface Guidance {
  evaluateVoters: string;
  contactDetails: string;
}

export const DEFAULT_GUIDANCE: Guidance = {
  evaluateVoters: DEFAULT_EVALUATE_VOTERS,
  contactDetails: DEFAULT_CONTACT_DETAILS,
};

export interface ContestInfoSliceState {
  title: string;
  prompt: Prompt;
  generatedSummary: string | null;
  seededGuidance: Guidance;
  emailSubscriptionAddress: string;
  phoneNumberForSubscription: PhoneNumberValue;
}

export interface ContestInfoSliceActions {
  setTitle: (title: string) => void;
  setPrompt: (prompt: Prompt) => void;
  setGeneratedSummary: (generatedSummary: string | null) => void;
  setSeededGuidance: (seededGuidance: Guidance) => void;
  setEmailSubscriptionAddress: (emailSubscriptionAddress: string) => void;
  setPhoneNumberForSubscription: (phoneNumberForSubscription: PhoneNumberValue) => void;
}

export type ContestInfoSlice = ContestInfoSliceState & ContestInfoSliceActions;

export const createContestInfoSlice = (set: any): ContestInfoSlice => ({
  title: "",
  prompt: {
    summarize: "",
    ...DEFAULT_GUIDANCE,
  },
  generatedSummary: null,
  seededGuidance: DEFAULT_GUIDANCE,
  emailSubscriptionAddress: "",
  phoneNumberForSubscription: EMPTY_PHONE_NUMBER,

  setTitle: (title: string) => set({ title }),
  setPrompt: (prompt: Prompt) => set({ prompt }),
  setGeneratedSummary: (generatedSummary: string | null) => set({ generatedSummary }),
  setSeededGuidance: (seededGuidance: Guidance) => set({ seededGuidance }),
  setEmailSubscriptionAddress: (emailSubscriptionAddress: string) => set({ emailSubscriptionAddress }),
  setPhoneNumberForSubscription: (phoneNumberForSubscription: PhoneNumberValue) => set({ phoneNumberForSubscription }),
});
