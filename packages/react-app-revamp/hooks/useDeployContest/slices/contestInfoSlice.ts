import { EMPTY_PHONE_NUMBER } from "lib/phone";
import { PhoneNumberValue } from "lib/phone/types";

export type Prompt = {
  summarize: string;
  evaluateVoters: string;
  contactDetails?: string;
  imageUrl?: string;
  imageFileName?: string;
};

export interface ContestInfoSliceState {
  title: string;
  prompt: Prompt;
  generatedSummary: string | null;
  emailSubscriptionAddress: string;
  phoneNumberForSubscription: PhoneNumberValue;
}

export interface ContestInfoSliceActions {
  setTitle: (title: string) => void;
  setPrompt: (prompt: Prompt) => void;
  setGeneratedSummary: (generatedSummary: string | null) => void;
  setEmailSubscriptionAddress: (emailSubscriptionAddress: string) => void;
  setPhoneNumberForSubscription: (phoneNumberForSubscription: PhoneNumberValue) => void;
}

export type ContestInfoSlice = ContestInfoSliceState & ContestInfoSliceActions;

export const createContestInfoSlice = (set: any): ContestInfoSlice => ({
  title: "",
  prompt: {
    summarize: "",
    evaluateVoters:
      'Voters should evaluate based on whichever option they think will make the most <a href="https://docs.confetti.win/calculating-roi" target="_blank">money</a> 😈',
    contactDetails:
      '<p>join the Confetti telegram: https://t.me/+rW5X0MqnTXBkOGIx</p><p>follow <a href="https://x.com/confetti_win" target="_blank">@Confetti_win</a></p>',
  },
  generatedSummary: null,
  emailSubscriptionAddress: "",
  phoneNumberForSubscription: EMPTY_PHONE_NUMBER,

  setTitle: (title: string) => set({ title }),
  setPrompt: (prompt: Prompt) => set({ prompt }),
  setGeneratedSummary: (generatedSummary: string | null) => set({ generatedSummary }),
  setEmailSubscriptionAddress: (emailSubscriptionAddress: string) => set({ emailSubscriptionAddress }),
  setPhoneNumberForSubscription: (phoneNumberForSubscription: PhoneNumberValue) => set({ phoneNumberForSubscription }),
});
