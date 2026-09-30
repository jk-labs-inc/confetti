import VotingSidebar from "@components/_pages/Contest/VotingSidebar";
import { FC } from "react";
import { useVisibleViewportMaxHeight } from "../../hooks/useVisibleViewportMaxHeight";
import { VOTE_RAIL_SCROLL_CLASS_NAME } from "./constants";

const StickyVoteRail: FC = () => {
  const ref = useVisibleViewportMaxHeight();

  return (
    <aside ref={ref} className={`sticky top-0 max-h-dvh ${VOTE_RAIL_SCROLL_CLASS_NAME}`}>
      <VotingSidebar />
    </aside>
  );
};

export default StickyVoteRail;
