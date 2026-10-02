import { useContestActivityFeed } from "@hooks/useContestActivityFeed";
import { FC } from "react";
import ActivityRows from "./ActivityRows";
import ActivitySkeleton from "./ActivitySkeleton";
import { ACTIVITY_SKELETON_ROWS } from "./constants";

const ActivityList: FC = () => {
  const { votes, rankById, entryTitlesById, isLoading } = useContestActivityFeed();

  if (isLoading && votes.length === 0) return <ActivitySkeleton count={ACTIVITY_SKELETON_ROWS} />;
  if (votes.length === 0) return <p className="py-2 text-[11px] text-neutral-9">no votes yet</p>;

  return <ActivityRows votes={votes} rankById={rankById} entryTitlesById={entryTitlesById} />;
};

export default ActivityList;
