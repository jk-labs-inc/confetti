import { emailRegex } from "@helpers/regex";
import { create } from "zustand";

interface VotingStore {
  inputValue: string;
  sliderValue: number;
  isInvalid: boolean;
  isFocused: boolean;
  emailAddress: string;
  setInputValue: (value: string, maxBalance: string) => void;
  setSliderValue: (value: number, maxBalance: string, isConnected: boolean) => void;
  setIsFocused: (focused: boolean) => void;
  setEmailAddress: (email: string) => void;
  handleMaxClick: (maxBalance: string, isConnected: boolean) => void;
  reset: () => void;
}

const INITIAL_STATE = {
  inputValue: "",
  sliderValue: 0,
  isInvalid: false,
  isFocused: true,
  emailAddress: "",
};

export const useVotingStore = create<VotingStore>((set, get) => ({
  ...INITIAL_STATE,

  setInputValue: (value: string, maxBalance: string) => {
    const numericInput = parseFloat(value);
    const maxBalanceNum = parseFloat(maxBalance);

    let newSliderValue = 0;
    let isInvalid = false;

    if (!isNaN(numericInput) && numericInput > 0 && maxBalanceNum > 0) {
      const percentage = (numericInput / maxBalanceNum) * 100;
      newSliderValue = Math.min(100, Math.round(percentage));
      isInvalid = numericInput > maxBalanceNum;
    }

    set({ inputValue: value, sliderValue: newSliderValue, isInvalid });
  },

  setSliderValue: (value: number, maxBalance: string, isConnected: boolean) => {
    if (!isConnected) {
      return;
    }

    const maxBalanceNum = parseFloat(maxBalance);
    const calculatedBalance = (value / 100) * maxBalanceNum;
    const balanceString = calculatedBalance === 0 ? "" : calculatedBalance.toString();

    set({
      inputValue: balanceString,
      sliderValue: value,
      isInvalid: false,
    });
  },

  setIsFocused: (focused: boolean) => set({ isFocused: focused }),

  setEmailAddress: (email: string) => {
    // Only set email if it's empty or matches the email regex
    if (email === "" || emailRegex.test(email)) {
      set({ emailAddress: email });
    }
  },

  handleMaxClick: (maxBalance: string, isConnected: boolean) => {
    if (!isConnected) {
      return;
    }

    set({
      inputValue: maxBalance,
      sliderValue: 100,
      isInvalid: false,
    });
  },

  reset: () => set(INITIAL_STATE),
}));
