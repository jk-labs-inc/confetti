import { useCreateContestFormStore } from "../store";
import { CreateFormErrorLocation, FormSection } from "../types";

export const TITLE_FIELD_ID = "create-contest-title";
export const TITLE_INPUT_ID = "create-contest-title-input";
export const SIGNUP_BLOCK_ID = "create-contest-signup";

export const sectionElementId = (section: FormSection) => `create-section-${section}`;

const scrollToElement = (elementId: string) => {
  document.getElementById(elementId)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

export const useSectionNavigation = () => {
  const openSection = useCreateContestFormStore(state => state.openSection);

  const openAndScrollTo = (section: FormSection) => {
    openSection(section);
    scrollToElement(sectionElementId(section));
  };

  const scrollToError = (location: CreateFormErrorLocation) => {
    if (location === "title") {
      document.getElementById(TITLE_INPUT_ID)?.focus({ preventScroll: true });
      scrollToElement(TITLE_FIELD_ID);
    } else if (location === "signup") {
      scrollToElement(SIGNUP_BLOCK_ID);
    } else {
      openAndScrollTo(location);
    }
  };

  return { openAndScrollTo, scrollToError };
};
