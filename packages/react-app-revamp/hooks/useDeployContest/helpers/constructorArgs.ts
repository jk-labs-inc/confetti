import { toFixedString } from "@helpers/formatBalance";
import { differenceInSeconds, getUnixTime } from "date-fns";
import { isWholeChargedAmount, VoteCurrency, voteCurrencyAddress } from "lib/voteCurrency";
import { parseEther } from "viem";
import { JK_LABS_SPLIT_DESTINATION_DEFAULT, MAX_SUBMISSIONS_LIMIT } from "../index";
import { Charge, PriceCurve } from "../types";
import { getContestEntryType } from "./index";
import { EntryPreviewConfig } from "../slices/contestMetadataSlice";

export interface ConstructorArgsParams {
  title: string;
  combinedPrompt: string;
  submissionOpen: Date;
  votingOpen: Date;
  votingClose: Date;
  advancedOptions: {
    rankLimit: number;
  };
  charge: Charge;
  priceCurve: PriceCurve;
  entryPreviewConfig: EntryPreviewConfig;
  clientAccountAddress?: string;
  jkLabsSplitDestination: string;
  voteCurrency: VoteCurrency;
}

export const prepareConstructorArgs = (params: ConstructorArgsParams) => {
  const {
    title,
    combinedPrompt,
    submissionOpen,
    votingOpen,
    votingClose,
    advancedOptions,
    charge,
    priceCurve,
    entryPreviewConfig,
    jkLabsSplitDestination,
    voteCurrency,
  } = params;

  const costToVote = parseEther(toFixedString(charge.costToVote));

  if (!isWholeChargedAmount(voteCurrency, costToVote)) {
    throw new Error(`a starting price of ${charge.costToVote} ${voteCurrency.symbol} cannot be charged exactly`);
  }

  const intConstructorArgs = {
    anyoneCanSubmit: entryPreviewConfig.isAnyoneCanSubmit ? 1 : 0,
    contestStart: getUnixTime(submissionOpen),
    votingDelay: differenceInSeconds(votingOpen, submissionOpen),
    votingPeriod: differenceInSeconds(votingClose, votingOpen),
    numAllowedProposalSubmissions: MAX_SUBMISSIONS_LIMIT,
    maxProposalCount: MAX_SUBMISSIONS_LIMIT,
    rankLimit: advancedOptions.rankLimit,
    percentageToRewards: charge.percentageToRewards,
    creatorSplitEnabled: charge.creatorSplitEnabled,
    priceCurveType: priceCurve.type,
    costToVote,
    multiple: parseEther(toFixedString(priceCurve.multiple)),
  };

  const constructorArgs = {
    name: title,
    prompt: combinedPrompt,
    intConstructorArgs,
    jkLabsSplitDestination: jkLabsSplitDestination || JK_LABS_SPLIT_DESTINATION_DEFAULT,
    contestEntryType: getContestEntryType(entryPreviewConfig),
    voteCurrency: voteCurrencyAddress(voteCurrency),
  };

  return constructorArgs;
};
