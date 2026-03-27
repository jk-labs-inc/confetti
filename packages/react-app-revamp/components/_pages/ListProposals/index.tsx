import ButtonV3, { ButtonSize } from "@components/UI/ButtonV3";
import ProposalContent from "@components/_pages/ProposalContent";
import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import { useContestStore } from "@hooks/useContest/store";
import useContestConfigStore from "@hooks/useContestConfig/store";
import useDeleteProposal from "@hooks/useDeleteProposal";
import { useMetadataStore } from "@hooks/useMetadataFields/store";
import useProposal from "@hooks/useProposal";
import { useProposalStore } from "@hooks/useProposal/store";
import { useWallet } from "@hooks/useWallet";
import { switchChain } from "@wagmi/core";
import { LayoutGroup, motion } from "motion/react";
import { useState } from "react";
import useInfiniteScroll from "react-infinite-scroll-hook";
import { useShallow } from "zustand/shallow";
import { verifyEntryPreviewPrompt } from "../DialogModalSendProposal/utils";
import ListProposalsContainer from "./container";
import ListProposalsLoader from "./loader";
import ListProposalsSkeleton from "./skeleton";

export const ListProposals = () => {
  const {
    chain: { id: userChainId },
  } = useWallet();
  const { contestConfig } = useContestConfigStore(useShallow(state => state));
  const { fetchProposalsPage } = useProposal();
  const { deleteProposal, isLoading: isDeleteInProcess, isSuccess: isDeleteSuccess } = useDeleteProposal();
  const {
    listProposalsIds,
    isPageProposalsLoading,
    initialMappedProposalIds,
    currentPagePaginationProposals,
    indexPaginationProposals,
    submissionsCount,
    totalPagesPaginationProposals,
    listProposalsData,
  } = useProposalStore(state => state);
  const { contestAuthorEthereumAddress } = useContestStore(state => state);
  const [deletingProposalIds, setDeletingProposalIds] = useState<string[]>([]);
  const [selectedProposalIds, setSelectedProposalIds] = useState<string[]>([]);
  const showDeleteButton = selectedProposalIds.length > 0 && !isDeleteInProcess;
  const isUserOnCorrectChain = contestConfig.chainId === userChainId;
  const { fields: metadataFieldsConfig } = useMetadataStore(state => state);
  const { enabledPreview } =
    metadataFieldsConfig.length > 0
      ? verifyEntryPreviewPrompt(metadataFieldsConfig[0].prompt)
      : { enabledPreview: null };

  const hasNextPage = listProposalsData.length < submissionsCount;

  const handleLoadMore = () => {
    fetchProposalsPage(
      {
        chainId: contestConfig.chainId,
        address: contestConfig.address as `0x${string}`,
        abi: contestConfig.abi,
      },
      contestConfig.version,
      currentPagePaginationProposals + 1,
      indexPaginationProposals[currentPagePaginationProposals + 1],
      totalPagesPaginationProposals,
      initialMappedProposalIds,
    );
  };

  const [infiniteRef] = useInfiniteScroll({
    loading: isPageProposalsLoading,
    hasNextPage,
    onLoadMore: handleLoadMore,
    rootMargin: "0px 0px 600px 0px",
    disabled: false,
  });

  const onDeleteSelectedProposals = async () => {
    setDeletingProposalIds(selectedProposalIds);

    if (!isUserOnCorrectChain) {
      await switchChain(getWagmiConfig(), { chainId: contestConfig.chainId });
    }

    await deleteProposal(selectedProposalIds);
    if (isDeleteSuccess) {
      setDeletingProposalIds([]);
    }
    setSelectedProposalIds([]);
  };

  const toggleProposalSelection = (proposalId: string) => {
    setSelectedProposalIds(prevIds => {
      if (prevIds.includes(proposalId)) {
        return prevIds.filter(id => id !== proposalId);
      } else {
        if (prevIds.length >= 50) {
          alert("You can only select up to 50 proposals in one take.");
          return prevIds;
        }
        return [...prevIds, proposalId];
      }
    });
  };

  if (isPageProposalsLoading && !listProposalsData.length) {
    return <ListProposalsLoader ref={infiniteRef} />;
  }

  return (
    <>
      <LayoutGroup>
        <ListProposalsContainer enabledPreview={enabledPreview}>
          {listProposalsData.map((proposal, index) => {
            if (deletingProposalIds.includes(proposal.id) && isDeleteInProcess) {
              return (
                <motion.div key={`deleting-${proposal.id}`} layout transition={{ duration: 0.4, ease: "easeInOut" }}>
                  <ListProposalsSkeleton enabledPreview={enabledPreview} highlightColor="#FF78A9" count={1} />
                </motion.div>
              );
            }
            return (
              <motion.div
                key={proposal.id}
                layout
                layoutId={proposal.id}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <ProposalContent
                  proposal={{
                    id: proposal.id,
                    authorEthereumAddress: proposal.author,
                    content: proposal.description,
                    exists: proposal.exists,
                    isContentImage: proposal.isContentImage,
                    tweet: proposal.tweet,
                    votes: proposal.netVotes,
                    rank: proposal.rank,
                    isTied: proposal.isTied,
                    commentsCount: proposal.commentsCount,
                    // TODO: check if this is correct (it is, but we need to fix the type, we can do this afterwards)
                    // @ts-ignore
                    metadataFields: proposal.metadataFields ?? [],
                  }}
                  enabledPreview={enabledPreview}
                  selectedProposalIds={selectedProposalIds}
                  toggleProposalSelection={toggleProposalSelection}
                  contestAuthorEthereumAddress={contestAuthorEthereumAddress}
                />
              </motion.div>
            );
          })}
        </ListProposalsContainer>
      </LayoutGroup>

      {hasNextPage && <ListProposalsLoader ref={infiniteRef} />}

      {showDeleteButton && (
        <div className="flex sticky bottom-0 left-0 right-0 p-4">
          <ButtonV3
            size={ButtonSize.EXTRA_LARGE}
            colorClass="bg-gradient-light-pink mx-auto animate-appear"
            onClick={onDeleteSelectedProposals}
          >
            Delete {selectedProposalIds.length} {selectedProposalIds.length === 1 ? "entry" : "entries"}
          </ButtonV3>
        </div>
      )}
    </>
  );
};

export default ListProposals;
