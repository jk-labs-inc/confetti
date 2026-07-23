import { create } from "zustand";
import { FormSection } from "./types";

interface CreateContestFormState {
  openSections: Record<FormSection, boolean>;
  // counts create-clicks: >0 means errors are displayed, and each increment forces
  // a revalidation of time-dependent checks even when no form input changed
  submitCount: number;
}

interface CreateContestFormActions {
  toggleSection: (section: FormSection) => void;
  openSection: (section: FormSection) => void;
  incrementSubmitCount: () => void;
  reset: () => void;
}

export type CreateContestFormStore = CreateContestFormState & CreateContestFormActions;

const initialState: CreateContestFormState = {
  openSections: {
    duration: true,
    description: false,
    parameters: false,
    priceCurve: false,
    rewards: false,
  },
  submitCount: 0,
};

export const useCreateContestFormStore = create<CreateContestFormStore>(set => ({
  ...initialState,
  toggleSection: section =>
    set(state => ({
      openSections: { ...state.openSections, [section]: !state.openSections[section] },
    })),
  openSection: section =>
    set(state => ({
      openSections: { ...state.openSections, [section]: true },
    })),
  incrementSubmitCount: () => set(state => ({ submitCount: state.submitCount + 1 })),
  reset: () => set(initialState),
}));
