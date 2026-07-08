import { EMPTY_PHONE_NUMBER } from "lib/phone";
import { PhoneNumberValue } from "lib/phone/types";
import { create } from "zustand";

interface SubmitProposalState {
  isLoading: boolean;
  isSuccess: boolean;
  error: string;
  proposalId: string;
  transactionData: any;
  wantsSubscription: boolean;
  emailForSubscription?: string;
  emailAlreadyExists?: boolean;
  phoneNumberForSubscription: PhoneNumberValue;
  phoneNumberAlreadyExists?: boolean;
  setTransactionData: (value: any) => void;
  setWantsSubscription: (value: boolean) => void;
  setEmailForSubscription: (value: string) => void;
  setEmailAlreadyExists: (value: boolean) => void;
  setPhoneNumberForSubscription: (value: PhoneNumberValue) => void;
  setPhoneNumberAlreadyExists: (value: boolean) => void;
  setProposalId: (value: string) => void;
  setIsLoading: (value: boolean) => void;
  setIsSuccess: (value: boolean) => void;
  setError: (value: string) => void;
}

export const useSubmitProposalStore = create<SubmitProposalState>(set => ({
  isLoading: false,
  wantsSubscription: false,
  isSuccess: false,
  error: "",
  proposalId: "",
  transactionData: null,
  emailForSubscription: "",
  emailAlreadyExists: false,
  phoneNumberForSubscription: EMPTY_PHONE_NUMBER,
  phoneNumberAlreadyExists: false,
  setTransactionData: (value: any) => set({ transactionData: value }),
  setWantsSubscription: (value: boolean) => set({ wantsSubscription: value }),
  setEmailForSubscription: (value: string) => set({ emailForSubscription: value }),
  setEmailAlreadyExists: (value: boolean) => set({ emailAlreadyExists: value }),
  setPhoneNumberForSubscription: (value: PhoneNumberValue) => set({ phoneNumberForSubscription: value }),
  setPhoneNumberAlreadyExists: (value: boolean) => set({ phoneNumberAlreadyExists: value }),
  setProposalId: (value: string) => set({ proposalId: value }),
  setIsLoading: (value: boolean) => set({ isLoading: value }),
  setIsSuccess: (value: boolean) => set({ isSuccess: value }),
  setError: (value: string) => set({ error: value }),
}));
