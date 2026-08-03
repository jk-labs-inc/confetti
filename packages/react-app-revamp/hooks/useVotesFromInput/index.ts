import { votesFromSpend } from "lib/voteProjections";

interface UseVotesFromInputProps {
  inputValue: string;
  costToVote: string;
}

/**
 * Calculate votes based on user's input value
 * @returns number of votes user will get for their input
 */
export const useVotesFromInput = ({ inputValue, costToVote }: UseVotesFromInputProps): number => {
  return votesFromSpend(inputValue, costToVote);
};
