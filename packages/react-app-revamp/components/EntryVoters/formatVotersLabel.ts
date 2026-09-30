import { pluralize } from "@helpers/pluralize";
import { CHIP_MAX_FACES } from "./constants";

export const formatVotersLabel = (voterCount: number): string | null =>
  voterCount > CHIP_MAX_FACES ? `+${voterCount - CHIP_MAX_FACES}` : null;

export const formatVotersAriaLabel = (voterCount: number): string =>
  `see all ${pluralize(voterCount, "voter", "voters")}`;
