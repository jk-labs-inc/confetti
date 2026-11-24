import { toastError } from "@components/UI/Toast";
import { indexContest } from "../database";
import { ContestData, prepareContestData } from "../helpers/contestData";
import { prepareConstructorArgs } from "../helpers/constructorArgs";
import { Charge } from "../types";

interface PrepareContestDataParams {
  constructorArgs: ReturnType<typeof prepareConstructorArgs>;
  combinedPrompt: string;
  contractAddress: string;
  address: string;
  chainName?: string;
  contestData: {
    title: string;
    submissionOpen: Date;
    votingOpen: Date;
    votingClose: Date;
    charge: Charge;
  };
}

export const prepareContestDataForIndexing = (params: PrepareContestDataParams) => {
  return prepareContestData({
    title: params.contestData.title,
    isAnyoneCanSubmit: params.constructorArgs.intConstructorArgs.anyoneCanSubmit === 1,
    combinedPrompt: params.combinedPrompt,
    submissionOpen: params.contestData.submissionOpen,
    votingOpen: params.contestData.votingOpen,
    votingClose: params.contestData.votingClose,
    contractAddress: params.contractAddress,
    address: params.address,
    chainName: params.chainName,
    charge: params.contestData.charge,
    voteCurrencyAddress: params.constructorArgs.voteCurrency,
  });
};

export const indexContestInDatabase = async (contestData: ContestData) => {
  try {
    await indexContest(contestData);
  } catch (error) {
    toastError({
      message: "contest deployment failed to index in db",
    });
    throw error;
  }
};
