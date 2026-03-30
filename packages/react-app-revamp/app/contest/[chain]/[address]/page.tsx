import { parsePrompt } from "@components/_pages/Contest/components/Prompt/utils";
import { chains } from "@config/wagmi/chains";
import { serverConfig } from "@config/wagmi";
import { getChainId } from "@helpers/getChainId";
import getContestContractVersion from "@helpers/getContestContractVersion";
import { readContracts } from "@wagmi/core";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { parse } from "node-html-parser";
import { Abi } from "viem";
import Contest from "./contest";

export const dynamic = 'force-dynamic';

const REGEX_ETHEREUM_ADDRESS = /^0x[a-fA-F0-9]{40}$/;

const defaultMetadata = {
  title: "Contest",
  description: "",
  openGraph: {
    title: "Contest",
    description: "",
  },
  twitter: {
    title: "Contest",
    description: "",
  },
};

async function getContestDetails(address: string, chainName: string) {
  try {
    const chainId = chains.filter(
      (chain: { name: string }) => chain.name.toLowerCase().replace(" ", "") === chainName.toLowerCase(),
    )?.[0]?.id;

    const { abi } = await getContestContractVersion(address, chainId);

    const contracts = [
      {
        address: address as `0x${string}`,
        abi: abi as Abi,
        chainId,
        functionName: "name",
        args: [],
      },
      {
        address: address as `0x${string}`,
        abi: abi as Abi,
        chainId,
        functionName: "prompt",
        args: [],
      },
    ];

    const results = (await readContracts(serverConfig, { contracts })) as any;
    return results;
  } catch (error) {
    console.error("failed to fetch contest details:", error);
    return [{ result: "" }, { result: "||" }];
  }
}

export async function generateMetadata(props: {
  params: Promise<{ chain: string; address: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { chain, address } = params;

  if (!address || address === "undefined" || !chain) {
    return defaultMetadata;
  }

  try {
    const contestDetails = await getContestDetails(address, chain);
    const contestTitle = contestDetails[0].result as string;
    const prompt = contestDetails[1].result as string;
    const contestPrompt = parsePrompt(prompt);
    const contestDescriptionRaw =
      contestPrompt.contestSummary + contestPrompt.contestEvaluate + contestPrompt.contestContactDetails;

    const contestDescription = parse(contestDescriptionRaw).textContent;

    return {
      title: contestTitle || defaultMetadata.title,
      description: contestDescription,
      openGraph: {
        title: contestTitle || defaultMetadata.title,
        description: contestDescription,
      },
      twitter: {
        title: contestTitle || defaultMetadata.title,
        description: contestDescription,
      },
    };
  } catch (error) {
    console.error("failed to generate metadata:", error);
    return defaultMetadata;
  }
}

const Page = async (props: { params: Promise<{ chain: string; address: string }> }) => {
  const params = await props.params;
  const { chain, address } = params;

  try {
    if (!REGEX_ETHEREUM_ADDRESS.test(address)) {
      return notFound();
    }

    const isValidChain = chains.some(
      (c: { name: string }) => c.name.toLowerCase().replace(" ", "") === chain.toLowerCase(),
    );

    if (!isValidChain) {
      return notFound();
    }

    const chainId = getChainId(chain);
    const { abi, version } = await getContestContractVersion(address, chainId);

    return <Contest address={address} chain={chain} chainId={chainId} abi={abi as Abi} version={version} />;
  } catch (error) {
    console.error("failed to render contest page:", error);
    return notFound();
  }
};

export default Page;
