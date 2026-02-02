import { chains } from "@config/wagmi";
import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import { extractPathSegments } from "@helpers/extractPath";
import { getChainId } from "@helpers/getChainId";
import getContestContractVersion from "@helpers/getContestContractVersion";
import { getNativeTokenSymbol } from "@helpers/nativeToken";
import { verifyContractBytecode } from "@helpers/verifyContractBytecode";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import { useError } from "@hooks/useError";
import useProposal from "@hooks/useProposal";
import { useProposalStore } from "@hooks/useProposal/store";
import { readContracts } from "@wagmi/core";
import { compareVersions } from "compare-versions";
import { checkIfContestExists } from "lib/contests";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Abi } from "viem";
import { createResultGetter } from "./helpers";
import { ErrorType, useContestStore } from "./store";
import { getContracts, CREATOR_SPLIT_VERSION } from "./v3v4/contracts";

interface ContractConfigResult {
  contractConfig: {
    address: `0x${string}`;
    abi: any;
    chainId: number;
  };
  version: string;
  deployedBytecode?: string;
}

export interface ContractConfig {
  address: `0x${string}`;
  abi: any;
  chainId: number;
}

export function useContest() {
  const asPath = usePathname();
  const { chainName: chainFromUrl, address: addressFromUrl } = extractPathSegments(asPath ?? "");
  const [chainName, setChainName] = useState(chainFromUrl);
  const [address, setAddress] = useState(addressFromUrl);
  const [chainId, setChainId] = useState(
    chains.filter((chain: { name: string }) => chain.name.toLowerCase().replace(" ", "") === chainFromUrl)?.[0]?.id,
  );
  const {
    setError,
    isLoading,
    error,
    isSuccess,
    setIsSuccess,
    setIsLoading,
    setContestPrompt,
    setContestName,
    setContestAuthor,
    setContestMaxProposalCount,
    setIsV3,
    setVotesClose,
    setVotesOpen,
    setSubmissionsOpen,
    setCharge,
    setSortingEnabled,
    setCanEditTitleAndDescription,
    setContestMaxNumberSubmissionsPerUser,
  } = useContestStore(state => state);
  const { setContestConfig } = useContestConfigStore(state => state);
  const { setIsListProposalsSuccess, setIsListProposalsLoading, setListProposalsIds } = useProposalStore(
    state => state,
  );
  const { fetchProposalsIdsList } = useProposal();
  const { setContestState } = useContestStateStore(state => state);
  const { error: errorMessage, handleError } = useError();

  // Generate config for the contract
  async function getContractConfig(): Promise<ContractConfigResult | undefined> {
    try {
      const { abi, version, deployedBytecode } = await getContestContractVersion(address, chainId);

      if (abi === null) {
        setError(ErrorType.RPC);
        setIsSuccess(false);
        setIsListProposalsSuccess(false);
        setIsListProposalsLoading(false);
        setIsLoading(false);
        return;
      }

      const contractConfig = {
        address: address as `0x${string}`,
        abi: abi,
        chainId: chainId,
      };

      setContestConfigData(addressFromUrl, chainFromUrl, abi as Abi, version);

      return { contractConfig, version, deployedBytecode };
    } catch (e) {
      setError(ErrorType.CONTRACT);
      setIsSuccess(false);
      setIsListProposalsSuccess(false);
      setIsListProposalsLoading(false);
      setIsLoading(false);
    }
  }

  async function fetchContestContractData(contractConfig: ContractConfig, version: string) {
    try {
      const contracts = getContracts(contractConfig, version);
      const results = await readContracts(getWagmiConfig(), { contracts });

      setIsV3(true);

      const getResultByName = createResultGetter(contracts, results);

      const contestName = getResultByName("name") as string;
      const contestAuthor = getResultByName("creator") as string;
      const contestMaxNumberSubmissionsPerUser = Number(getResultByName("numAllowedProposalSubmissions"));
      const contestMaxProposalCount = Number(getResultByName("maxProposalCount"));
      const submissionsOpenDate = new Date(Number(getResultByName("contestStart")) * 1000 + 1000);
      const closingVoteDate = new Date(Number(getResultByName("contestDeadline")) * 1000 + 1000);
      const votesOpenDate = new Date(Number(getResultByName("voteStart")) * 1000 + 1000);
      const contestPrompt = getResultByName("prompt") as string;
      const contestState = getResultByName("state") as ContestStateEnum;

      if (compareVersions(version, "4.2") >= 0) {
        const sortingEnabled = Number(getResultByName("sortingEnabled")) === 1;
        setSortingEnabled(sortingEnabled);
      }

      if (compareVersions(version, "4.27") >= 0) {
        setCanEditTitleAndDescription(true);
      }

      const hasCreatorSplit = compareVersions(version, CREATOR_SPLIT_VERSION) >= 0;
      const percentageToRewards = hasCreatorSplit
        ? Number(getResultByName("percentageToRewards")) || 0
        : Number(getResultByName("percentageToCreator")) || 0;
      let costToVote = 0;

      if (compareVersions(version, "4.23") >= 0) {
        costToVote = Number(getResultByName("costToVote")) || 0;
      }

      setCharge({
        percentageToRewards,
        costToVote,
      });

      setContestName(contestName);
      setContestAuthor(contestAuthor);
      setContestMaxNumberSubmissionsPerUser(contestMaxNumberSubmissionsPerUser);
      setContestMaxProposalCount(contestMaxProposalCount);
      setSubmissionsOpen(submissionsOpenDate);
      setVotesClose(closingVoteDate);
      setVotesOpen(votesOpenDate);
      setContestPrompt(contestPrompt);
      setContestState(contestState);
      setError(null);
      setIsSuccess(true);
      setIsLoading(false);

      await fetchProposalsIdsList(contractConfig, version, {
        submissionOpen: submissionsOpenDate,
        votesOpen: votesOpenDate,
      });
    } catch (error) {
      console.error("Error in fetchContestContractData:", error);
      setError(ErrorType.CONTRACT);
      setIsLoading(false);
      setIsSuccess(false);
      throw error;
    }
  }

  async function fetchV3ContestInfo(contractConfig: ContractConfig, version: string) {
    try {
      setIsListProposalsLoading(false);

      await fetchContestContractData(contractConfig, version);
    } catch (e) {
      handleError(e, "Something went wrong while fetching the contest data.");
      setError(ErrorType.CONTRACT);
      setIsLoading(false);
      setIsListProposalsLoading(false);
    }
  }

  /**
   * Fetch contest data from the contract, depending on the version of the contract
   */
  async function fetchContestInfo() {
    setIsLoading(true);
    try {
      const [abiResult, isContestInDatabase] = await Promise.all([
        getContractConfig(),
        checkIfContestExists(addressFromUrl, chainFromUrl),
      ]);

      if (!abiResult) {
        setIsLoading(false);
        return;
      }

      const { contractConfig, version, deployedBytecode } = abiResult;

      const isBytecodeValid = deployedBytecode
        ? await verifyContractBytecode(addressFromUrl, chainId, deployedBytecode)
        : false;

      const isContestFromJokerace = isContestInDatabase && isBytecodeValid;

      if (!isContestFromJokerace) {
        setError(ErrorType.IS_NOT_JOKERACE_CONTRACT);
        setIsLoading(false);
        return;
      }

      if (compareVersions(version, "4.0") < 0) {
        setError(ErrorType.UNSUPPORTED_VERSION);
        setIsLoading(false);
        console.error(`Contest version ${version} is not supported. Only v4.0 and above are supported.`);
        return;
      }

      // Fetch contest info for v4 and above
      await fetchV3ContestInfo(contractConfig, version);
    } catch (error) {
      console.error("An error occurred while fetching data:", error);
    }
  }

  function setContestConfigData(contestAddress: string, contestChainName: string, abi: Abi, version: string) {
    const contestChainNativeCurrencySymbol = getNativeTokenSymbol(contestChainName);
    const chainId = getChainId(contestChainName);

    setContestConfig({
      address: contestAddress as `0x${string}`,
      chainName: contestChainName,
      chainId,
      chainNativeCurrencySymbol: contestChainNativeCurrencySymbol ?? "",
      abi: abi as Abi,
      version,
    });
  }

  return {
    getContractConfig,
    address,
    fetchContestInfo,
    setIsLoading,
    chainId,
    chainName,
    setChainId,
    isLoading,
    error,
    isSuccess,
    setChainName,
    retry: fetchContestInfo,
    onSearch: (addr: string, chainName: string) => {
      setChainName(chainName);
      setChainId(
        chains.filter((chain: { name: string }) => chain.name.toLowerCase().replace(" ", "") === chainName)?.[0]?.id,
      );
      setIsLoading(true);
      setIsListProposalsLoading(true);
      setListProposalsIds([]);
      setAddress(addr);
    },
  };
}

export default useContest;
