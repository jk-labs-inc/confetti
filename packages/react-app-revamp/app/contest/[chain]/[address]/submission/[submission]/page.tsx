import { serverConfig } from "@config/wagmi";
import { getChainId } from "@helpers/getChainId";
import getContestContractVersion from "@helpers/getContestContractVersion";
import { extractTitle } from "@components/_pages/Submission/Desktop/components/Body/components/Content/components/Title/utils/extractTitle";
import { verifyEntryPreviewPrompt } from "@components/_pages/DialogModalSendProposal/utils";
import { parseMetadataFieldsSchema } from "@hooks/useMetadataFields/helpers";
import { ProposalStaticData } from "@components/_pages/Submission/types";
import { readContracts } from "@wagmi/core";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Abi } from "viem";
import SubmissionWrapper from "./wrapper";

const REGEX_ETHEREUM_ADDRESS = /^0x[a-fA-F0-9]{40}$/;

const defaultMetadata = {
  title: "Contest Entry on Confetti",
  description: "Contest Entry on Confetti",
  openGraph: {
    title: "Contest Entry on Confetti",
    description: "Contest Entry on Confetti",
  },
  twitter: {
    title: "Contest Entry on Confetti",
    description: "Contest Entry on Confetti",
  },
};

async function getEntryMetadata(
  address: string,
  chainName: string,
  submissionId: string,
): Promise<{ contestName: string; entryTitle: string | null }> {
  const chainId = getChainId(chainName);
  const { abi } = await getContestContractVersion(address, chainId);

  const contractConfig = {
    address: address as `0x${string}`,
    abi: abi as Abi,
    chainId,
  };

  const results = await readContracts(serverConfig, {
    contracts: [
      { ...contractConfig, functionName: "name" },
      { ...contractConfig, functionName: "getProposal", args: [BigInt(submissionId)] },
      { ...contractConfig, functionName: "metadataFieldsSchema" },
    ],
  });

  const contestName = results[0].status === "success" ? (results[0].result as string) : "contest";

  if (results[1].status !== "success" || !results[1].result) {
    return { contestName, entryTitle: null };
  }

  const proposal = results[1].result as ProposalStaticData;

  const stringArray = proposal.fieldsMetadata?.stringArray ?? [];
  if (stringArray.length === 0) return { contestName, entryTitle: null };

  let enabledPreview = null;
  if (results[2].status === "success" && results[2].result) {
    const fields = parseMetadataFieldsSchema(results[2].result as string);
    if (fields.length > 0) {
      enabledPreview = verifyEntryPreviewPrompt(fields[0].prompt).enabledPreview;
    }
  }

  return { contestName, entryTitle: extractTitle(stringArray, enabledPreview) };
}

export async function generateMetadata(props: {
  params: Promise<{ chain: string; address: string; submission: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { chain, address, submission } = params;

  if (!address || address === "undefined" || !chain) {
    console.error("invalid params received:", { chain, address });
    return defaultMetadata;
  }

  try {
    const { contestName, entryTitle } = await getEntryMetadata(address, chain, submission);

    const title = entryTitle
      ? `Vote on ${entryTitle} in ${contestName}`
      : `Entry for ${contestName} contest on Confetti`;
    const description = entryTitle
      ? `Vote on ${entryTitle} in ${contestName} on Confetti`
      : `Entry for ${contestName} contest on Confetti`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
      },
      twitter: {
        title,
        description,
      },
    };
  } catch (error) {
    console.error("failed to generate metadata:", error);
    return defaultMetadata;
  }
}

const Page = async (props: { params: Promise<{ chain: string; address: string; submission: string }> }) => {
  const params = await props.params;
  const { chain, address, submission } = params;
  const chainId = getChainId(chain);
  const { abi, version } = await getContestContractVersion(address, chainId);

  try {
    if (!REGEX_ETHEREUM_ADDRESS.test(address) || !chain || !abi || !version) {
      return notFound();
    }

    return (
      <SubmissionWrapper
        address={address}
        chain={chain}
        submission={submission}
        abi={abi as Abi}
        version={version}
        chainId={chainId}
      />
    );
  } catch (error) {
    console.error("failed to render submission page:", error);
    return notFound();
  }
};

export default Page;
