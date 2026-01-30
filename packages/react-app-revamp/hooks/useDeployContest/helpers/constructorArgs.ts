import { differenceInSeconds, getUnixTime } from "date-fns";
import { parseEther } from "viem";
import { JK_LABS_SPLIT_DESTINATION_DEFAULT, MAX_SUBMISSIONS_LIMIT } from "../index";
import { Charge, PriceCurve } from "../types";
import { createMetadataFieldsSchema } from "./index";
import { EntryPreviewConfig, MetadataField } from "../slices/contestMetadataSlice";

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
  metadataFields: MetadataField[];
  entryPreviewConfig: EntryPreviewConfig;
  clientAccountAddress?: string;
  jkLabsSplitDestination: string;
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
    metadataFields,
    entryPreviewConfig,
    jkLabsSplitDestination,
  } = params;

  const intConstructorArgs = {
    anyoneCanSubmit: entryPreviewConfig.isAnyoneCanSubmit ? 1 : 0,
    contestStart: getUnixTime(submissionOpen),
    votingDelay: differenceInSeconds(votingOpen, submissionOpen),
    votingPeriod: differenceInSeconds(votingClose, votingOpen),
    numAllowedProposalSubmissions: MAX_SUBMISSIONS_LIMIT,
    maxProposalCount: MAX_SUBMISSIONS_LIMIT,
    sortingEnabled: 1,
    rankLimit: advancedOptions.rankLimit,
    percentageToRewards: charge.percentageToRewards,
    creatorSplitEnabled: charge.creatorSplitEnabled,
    priceCurveType: priceCurve.type,
    costToVote: parseEther(charge.costToVote.toString()),
    multiple: parseEther(priceCurve.multiple.toString()),
  };

  const constructorArgs = {
    name: title,
    prompt: combinedPrompt,
    intConstructorArgs,
    jkLabsSplitDestination: jkLabsSplitDestination || JK_LABS_SPLIT_DESTINATION_DEFAULT,
    metadataFieldsSchema: createMetadataFieldsSchema(metadataFields, entryPreviewConfig),
  };

  return constructorArgs;
};
