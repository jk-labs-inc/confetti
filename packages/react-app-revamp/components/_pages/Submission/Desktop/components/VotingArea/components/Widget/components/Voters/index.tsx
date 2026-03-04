import { ListProposalVotes } from "@components/_pages/ListProposalVotes";
import GradientText from "@components/UI/GradientText";
import useContestConfigStore from "@hooks/useContestConfig/store";
import Image from "next/image";
import { FC, useRef, useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";
import SubmissionPageDesktopVotingAreaWidgetVotersLoadingSkeleton from "./components/LoadingSkeleton";
import NoVotersPlaceholder from "./components/NoVotersPlaceholder";
import { useAddressesVoted } from "./hooks/useAddressesVoted";

interface SubmissionPageDesktopVotingAreaWidgetVotersProps {
  proposalId: string;
  onRefetchReady?: (refetch: () => void) => void;
}

const SubmissionPageDesktopVotingAreaWidgetVoters: FC<SubmissionPageDesktopVotingAreaWidgetVotersProps> = ({
  proposalId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState<number>(0);
  const { contestConfig } = useContestConfigStore(useShallow(state => state));
  const { addressesVoted, isLoadingAddressesVoted, isErrorAddressesVoted } = useAddressesVoted({
    contestAddress: contestConfig.address,
    contestAbi: contestConfig.abi,
    contestChainId: contestConfig.chainId,
    proposalId,
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      const currentHeight = containerRef.current?.clientHeight ?? 0;

      setMaxHeight(currentHeight);
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [addressesVoted]);

  if (isLoadingAddressesVoted) {
    return <SubmissionPageDesktopVotingAreaWidgetVotersLoadingSkeleton />;
  }

  if (isErrorAddressesVoted) {
    return (
      <div className="text-[16px] pl-8 pr-12 py-4 text-negative-11 font-bold">
        ruh-roh! we were unable to fetch the voters, please reload the page.
      </div>
    );
  }

  const votedAddressesArray = addressesVoted;
  const hasNoVoters = votedAddressesArray && votedAddressesArray.length === 0;
  const shouldShowPlaceholder = hasNoVoters;

  return (
    <div
      ref={containerRef}
      className="w-full flex-1"
      style={maxHeight ? { maxHeight: `${maxHeight}px` } : { height: "100%" }}
    >
      <div className="bg-gradient-voting-area-purple rounded-4xl pl-6 pr-12 pt-4 pb-8 w-full h-full flex flex-col">
        <div className="flex flex-col gap-6 min-h-0 flex-1">
          <div className="flex items-baseline gap-2 pr-6">
            <Image src="/entry/vote-ballot.svg" alt="voters" width={24} height={24} className="self-center" />
            <GradientText isFontSabo={false} textSizeClassName="text-[24px] font-bold">
              voters
            </GradientText>
            <p className="text-[16px] text-neutral-11 font-bold">{`(${votedAddressesArray.length})`}</p>
          </div>

          {shouldShowPlaceholder ? (
            <NoVotersPlaceholder />
          ) : (
            <ListProposalVotes
              proposalId={proposalId}
              votedAddresses={votedAddressesArray}
              className="text-neutral-11 text-[12px]"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmissionPageDesktopVotingAreaWidgetVoters;
