import { useContestActivityFeed } from "@hooks/useContestActivityFeed";
import { FC } from "react";
import ActivityChips from "./ActivityChips";
import ActivitySkeleton from "./ActivitySkeleton";

const ACTIVITY_SKELETON_CHIPS = 3;

const ActivityList: FC = () => {
  const { votes, rankById, entryTitlesById, isLoading } = useContestActivityFeed();

  if (isLoading && votes.length === 0) return <ActivitySkeleton count={ACTIVITY_SKELETON_CHIPS} />;
  if (votes.length === 0) return <p className="py-2 text-[11px] text-neutral-9">no votes yet</p>;

  return <ActivityChips votes={votes} rankById={rankById} entryTitlesById={entryTitlesById} />;
};

export default ActivityList;
