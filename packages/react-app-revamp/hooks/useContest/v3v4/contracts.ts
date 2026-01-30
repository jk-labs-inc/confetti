import { compareVersions } from "compare-versions";

enum VERSIONS {
  V4_0 = "4.0",
  V4_2 = "4.2",
  V4_23 = "4.23",
  V4_25 = "4.25",
  V4_29 = "4.29",
  V6_1 = "6.1",
}

export const CREATOR_SPLIT_VERSION = "6.12";

export function getContracts(contractConfig: any, version: string) {
  const commonFunctionNames = [
    "name",
    "creator",
    "numAllowedProposalSubmissions",
    "maxProposalCount",
    "contestStart",
    "contestDeadline",
    "voteStart",
    "prompt",
    "state",
  ];

  // Use new function names for versions >= CREATOR_SPLIT_VERSION, old names for earlier versions
  const hasCreatorSplit = compareVersions(version, CREATOR_SPLIT_VERSION) >= 0;
  const v4FunctionNames = hasCreatorSplit ? ["percentageToRewards"] : ["percentageToCreator"];

  const v4_2FunctionNames = ["sortingEnabled"];

  let contractFunctionNames = [...commonFunctionNames];

  if (compareVersions(version, VERSIONS.V4_0) >= 0) {
    contractFunctionNames = [...contractFunctionNames, ...v4FunctionNames];
  }
  if (compareVersions(version, VERSIONS.V4_2) >= 0) {
    contractFunctionNames = [...contractFunctionNames, ...v4_2FunctionNames];
  }

  if (compareVersions(version, VERSIONS.V4_23) >= 0) {
    contractFunctionNames = [...contractFunctionNames, "costToVote"];
  }

  const contracts = contractFunctionNames.map(functionName => ({
    ...contractConfig,
    functionName,
  }));

  return contracts;
}
