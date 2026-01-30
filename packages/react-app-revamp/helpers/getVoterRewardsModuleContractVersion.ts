import OnlyDeleteInEntryVoterRewards from "@contracts/bytecodeAndAbi/modules/VoterRewardsModule.5.10.onlyDeleteInEntry.sol/VoterRewardsModule.json";
import AntiRugVoterRewards from "@contracts/bytecodeAndAbi/modules/VoterRewardsModule.5.11.antiRug.sol/VoterRewardsModule.json";
import CorrectDelayVarVoterRewards from "@contracts/bytecodeAndAbi/modules/VoterRewardsModule.5.12.correctDelayVar.sol/VoterRewardsModule.json";
import RankLimitCheckVoterRewards from "@contracts/bytecodeAndAbi/modules/VoterRewardsModule.5.13.rankLimitCheck.sol/VoterRewardsModule.json";
import RmEntryRewardsVoterRewards from "@contracts/bytecodeAndAbi/modules/VoterRewardsModule.5.14.rmEntryRewards.sol/VoterRewardsModule.json";
import InitialVoterRewards from "@contracts/bytecodeAndAbi/modules/VoterRewardsModule.5.5.voterRewards.sol/VoterRewardsModule.json";
import SetPeriodLimitsVoterRewards from "@contracts/bytecodeAndAbi/modules/VoterRewardsModule.5.6.setPeriodLimits.sol/VoterRewardsModule.json";
import VotingPriceCurvesVoterRewards from "@contracts/bytecodeAndAbi/modules/VoterRewardsModule.5.7.votingPriceCurves.sol/VoterRewardsModule.json";
import AddModuleTrackingVoterRewards from "@contracts/bytecodeAndAbi/modules/VoterRewardsModule.5.8.addModuleTracking.sol/VoterRewardsModule.json";
import CalcCorrectMinuteVoterRewards from "@contracts/bytecodeAndAbi/modules/VoterRewardsModule.5.9.calcCorrectMinute.sol/VoterRewardsModule.json";
import VoteAndEarnOnlyVoterRewards from "@contracts/bytecodeAndAbi/modules/VoterRewardsModule.6.1.voteAndEarnOnly.sol/VoterRewardsModule.json";
import RmDeleteVotesUpdateVoterRewards from "@contracts/bytecodeAndAbi/modules/VoterRewardsModule.6.2.rmDeleteVotesUpdate.sol/VoterRewardsModule.json";
import DocsDeleteOnlyInEntryVoterRewards from "@contracts/bytecodeAndAbi/modules/VoterRewardsModule.6.3.docsDeleteOnlyInEntry.sol/VoterRewardsModule.json";
import RmUnusedErrorsVoterRewards from "@contracts/bytecodeAndAbi/modules/VoterRewardsModule.6.4.rmUnusedErrors.sol/VoterRewardsModule.json";
import OnlySetOfficialModuleOnceVoterRewards from "@contracts/bytecodeAndAbi/modules/VoterRewardsModule.6.5.onlySetOfficialModuleOnce.sol/VoterRewardsModule.json";
import FixStateErrorsVoterRewards from "@contracts/bytecodeAndAbi/modules/VoterRewardsModule.6.6.fixStateErrors.sol/VoterRewardsModule.json";
import UpdatePeriodConstraintsVoterRewards from "@contracts/bytecodeAndAbi/modules/VoterRewardsModule.6.7.updatePeriodConstraints.sol/VoterRewardsModule.json";
import CorrectPeriodConstraintsVoterRewards from "@contracts/bytecodeAndAbi/modules/VoterRewardsModule.6.8.correctPeriodConstraints.sol/VoterRewardsModule.json";
import AlwaysSelfFundVoterRewards from "@contracts/bytecodeAndAbi/modules/VoterRewardsModule.6.9.alwaysSelfFund.sol/VoterRewardsModule.json";
import DeprecateCostToEnterVoterRewards from "@contracts/bytecodeAndAbi/modules/VoterRewardsModule.6.10.deprecateCostToEnter.sol/VoterRewardsModule.json";
import DeprecateFlatCurvesVoterRewards from "@contracts/bytecodeAndAbi/modules/VoterRewardsModule.6.11.deprecateFlatCurves.sol/VoterRewardsModule.json";
import AddCreatorSplitVoterRewards from "@contracts/bytecodeAndAbi/modules/VoterRewardsModule.6.12.addCreatorSplit.sol/VoterRewardsModule.json";
import DeployedVoterRewardsContract from "@contracts/bytecodeAndAbi/modules/VoterRewardsModule.sol/VoterRewardsModule.json";
import { createPublicClient, getContract, http } from "viem";
import { getChainFromId } from "./getChainFromId";
import { executeWithTimeout, MAX_TIME_TO_WAIT_FOR_RPC } from "./timeout";

type ContractData = {
  abi: any;
  deployedBytecode?: { object: string };
};

const VERSION_TO_CONTRACT: Record<string, ContractData> = {
  "6.12": AddCreatorSplitVoterRewards,
  "6.11": DeprecateFlatCurvesVoterRewards,
  "6.10": DeprecateCostToEnterVoterRewards,
  "6.9": AlwaysSelfFundVoterRewards,
  "6.8": CorrectPeriodConstraintsVoterRewards,
  "6.7": UpdatePeriodConstraintsVoterRewards,
  "6.6": FixStateErrorsVoterRewards,
  "6.5": OnlySetOfficialModuleOnceVoterRewards,
  "6.4": RmUnusedErrorsVoterRewards,
  "6.3": DocsDeleteOnlyInEntryVoterRewards,
  "6.2": RmDeleteVotesUpdateVoterRewards,
  "6.1": VoteAndEarnOnlyVoterRewards,
  "5.14": RmEntryRewardsVoterRewards,
  "5.13": RankLimitCheckVoterRewards,
  "5.12": CorrectDelayVarVoterRewards,
  "5.11": AntiRugVoterRewards,
  "5.10": OnlyDeleteInEntryVoterRewards,
  "5.9": CalcCorrectMinuteVoterRewards,
  "5.8": AddModuleTrackingVoterRewards,
  "5.7": VotingPriceCurvesVoterRewards,
  "5.6": SetPeriodLimitsVoterRewards,
  "5.5": InitialVoterRewards,
};

export async function getVoterRewardsModuleContractVersion(address: string, chainId: number) {
  const chain = getChainFromId(chainId);
  const client = createPublicClient({
    chain: chain,
    transport: http(chain?.rpcUrls.default.http[0] ?? ""),
  });

  const contract = getContract({
    address: address as `0x${string}`,
    client,
    abi: InitialVoterRewards.abi,
  });

  try {
    const version = (await executeWithTimeout(MAX_TIME_TO_WAIT_FOR_RPC, contract.read.version())) as string;

    const contractData = VERSION_TO_CONTRACT[version] ?? DeployedVoterRewardsContract;

    return {
      abi: contractData.abi,
      version,
      deployedBytecode: contractData.deployedBytecode?.object,
    };
  } catch (error) {
    // If the version method does not exist or is failing, use the first version
    return {
      abi: InitialVoterRewards.abi,
      version: "unknown",
      deployedBytecode: InitialVoterRewards.deployedBytecode?.object,
    };
  }
}

export default getVoterRewardsModuleContractVersion;
