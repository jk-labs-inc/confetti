import { useSubmissionPageStore } from "@components/_pages/Submission/store";
import { ROUTE_VIEW_CONTEST } from "@config/routes";
import { getChainFromId } from "@helpers/getChainFromId";
import useContestConfigStore from "@hooks/useContestConfig/store";
import Link from "next/link";
import { useShallow } from "zustand/shallow";

const SubmissionPageDesktopContestTitle = () => {
  const { contestConfig } = useContestConfigStore(state => state);
  const contestName = useSubmissionPageStore(useShallow(state => state.contestDetails.name));
  const chain = getChainFromId(contestConfig.chainId);

  const contestUrl = ROUTE_VIEW_CONTEST.replace("[chain]", chain?.name.toLowerCase() ?? "").replace(
    "[address]",
    contestConfig.address,
  );

  return (
    <Link
      href={contestUrl}
      className="flex items-center gap-3 ml-8 h-10 bg-true-black border border-neutral-10 rounded-2xl py-2 px-4 w-fit hover:opacity-80 transition-opacity"
    >
      <img src="/entry/back.svg" alt="back-arrow" width={32} height={32} />
      <span className="text-neutral-11 font-bold text-2xl">{contestName}</span>
    </Link>
  );
};

export default SubmissionPageDesktopContestTitle;
