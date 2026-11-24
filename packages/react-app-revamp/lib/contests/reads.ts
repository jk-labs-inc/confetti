import { chains } from "@config/wagmi";
import getContestContractVersion from "@helpers/getContestContractVersion";
import { ContestStateEnum } from "@hooks/useContestState/types";
import { Config, readContracts } from "@wagmi/core";
import { Abi, Address } from "viem";
import { ContestContract, ContestDetails, ContestFieldsRead, ContestRef } from "./types";

const normalizeChainName = (chainName: string) => chainName.replace(/\s+/g, "").toLowerCase();

const hasFunction = (abi: Abi, functionName: string) =>
  abi.some(item => item.type === "function" && item.name === functionName);

export function findContestChain(networkName: string) {
  const contestChainName = normalizeChainName(networkName);
  return chains.find(chain => normalizeChainName(chain.name) === contestChainName);
}

export async function resolveContestContract(contest: ContestRef): Promise<ContestContract> {
  const chain = findContestChain(contest.network_name);
  if (!chain) throw new Error(`chain not found for ${contest.network_name}`);

  const { abi } = await getContestContractVersion(contest.address, chain.id);
  if (!abi) throw new Error(`contract version unreadable for contest ${contest.address}`);

  return { address: contest.address as Address, abi: abi as Abi, chainId: chain.id };
}

export async function readContestFields(config: Config, contract: ContestContract): Promise<ContestFieldsRead> {
  const [name, state, prompt] = await readContracts(config, {
    contracts: [
      { ...contract, functionName: "name", args: [] },
      { ...contract, functionName: "state", args: [] },
      { ...contract, functionName: "prompt", args: [] },
    ],
  });

  return {
    title: name.result as string | undefined,
    state: state.result as ContestStateEnum | undefined,
    prompt: prompt.result as string | undefined,
  };
}

export async function readContestDetails(config: Config, contract: ContestContract): Promise<ContestDetails> {
  const { title, state, prompt } = await readContestFields(config, contract);

  const isStateUnread = state === undefined && hasFunction(contract.abi, "state");
  const isPromptUnread = prompt === undefined && hasFunction(contract.abi, "prompt");
  if (title === undefined || isStateUnread || isPromptUnread) {
    throw new Error(`contest details unreadable for ${contract.address}`);
  }

  return { title, isCanceled: state === ContestStateEnum.Canceled, prompt: prompt ?? null };
}
