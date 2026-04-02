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
  emailSubscriptionAddress: string;
}

export interface ContestInfoSliceActions {
  setTitle: (title: string) => void;
  setPrompt: (prompt: Prompt) => void;
  setEmailSubscriptionAddress: (emailSubscriptionAddress: string) => void;
}

export type ContestInfoSlice = ContestInfoSliceState & ContestInfoSliceActions;

export const createContestInfoSlice = (set: any): ContestInfoSlice => ({
  title: "",
  prompt: {
    summarize: "",
    evaluateVoters: "Voters should evaluate based on whichever option they think will make the most <a href=\"https://docs.confetti.win/calculating-roi\" target=\"_blank\">money</a> 😈",
    contactDetails: "<p>join the Confetti telegram: https://t.me/+rW5X0MqnTXBkOGIx</p><p>follow <a href=\"https://x.com/confetti_win\" target=\"_blank\">@Confetti_win</a></p>",
  },
  emailSubscriptionAddress: "",

  setTitle: (title: string) => set({ title }),
  setPrompt: (prompt: Prompt) => set({ prompt }),
  setEmailSubscriptionAddress: (emailSubscriptionAddress: string) => set({ emailSubscriptionAddress }),
});
