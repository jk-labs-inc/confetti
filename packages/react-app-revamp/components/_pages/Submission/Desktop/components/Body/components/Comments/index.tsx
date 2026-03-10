import Comments from "@components/Comments";
import GradientText from "@components/UI/GradientText";
import { useSubmissionPageStore } from "@components/_pages/Submission/store";
import useContestConfigStore from "@hooks/useContestConfig/store";
import useProposalIdStore from "@hooks/useProposalId/store";
import Image from "next/image";
import { useShallow } from "zustand/shallow";
import useNumberOfComments from "./hooks/useNumberOfComments";
import SubmissionPageDesktopBodyCommentsLoadingSkeleton from "./components/LoadingSkeleton";
import { ContestStateEnum } from "@hooks/useContestState/store";

const SubmissionPageDesktopBodyComments = () => {
  const contestConfig = useContestConfigStore(useShallow(state => state.contestConfig));
  const proposalId = useProposalIdStore(useShallow(state => state.proposalId));
  const { contestAuthor, contestState } = useSubmissionPageStore(
    useShallow(state => ({
      contestAuthor: state.proposalStaticData?.author,
      contestState: state.contestDetails.state,
    })),
  );
  const { numberOfComments, isLoading } = useNumberOfComments({
    contestAddress: contestConfig.address,
    contestChainId: contestConfig.chainId,
    contestAbi: contestConfig.abi,
    proposalId: proposalId,
  });

  if (isLoading) {
    return <SubmissionPageDesktopBodyCommentsLoadingSkeleton />;
  }

  if (
    contestState === ContestStateEnum.Canceled ||
    (contestState === ContestStateEnum.Completed && numberOfComments === 0)
  ) {
    return null;
  }

  return (
    <div className="pl-4 pr-4 pb-4">
      <div
        className={`w-full flex flex-col gap-2 pl-6 py-4 bg-gradient-comments-area-purple rounded-4xl ${
          numberOfComments !== undefined && numberOfComments > 0 ? "h-52" : "h-auto"
        }`}
      >
        <div className="flex items-baseline gap-2">
          <Image src="/entry/comment.svg" alt="comments" width={24} height={24} className="self-center mt-1" />
          <GradientText isFontSabo={false} textSizeClassName="text-[24px] font-bold">
            comments
          </GradientText>
          <p className="text-[16px] text-neutral-11 font-bold">
            {numberOfComments !== undefined && `(${numberOfComments})`}
          </p>
        </div>
        <div className="flex-1 min-h-0">
          <Comments
            contestAddress={contestConfig.address}
            contestChainId={contestConfig.chainId}
            proposalId={proposalId}
            numberOfComments={numberOfComments ?? null}
            contestAuthor={contestAuthor ?? ""}
            contestState={contestState}
          />
        </div>
      </div>
    </div>
  );
};

export default SubmissionPageDesktopBodyComments;
