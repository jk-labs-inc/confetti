import { VotingWidgetLayout } from "@components/Voting/types";
import { FC } from "react";
import { PROJECTION_LAYOUT_CLASS_NAMES } from "../../constants";

interface VotingWidgetRewardsProjectionContainerProps {
  children: React.ReactNode;
  layout?: VotingWidgetLayout;
}

const VotingWidgetRewardsProjectionContainer: FC<VotingWidgetRewardsProjectionContainerProps> = ({
  children,
  layout = VotingWidgetLayout.regular,
}) => {
  return (
    <div
      className={`flex items-center bg-transparent rounded-2xl border border-neutral-17 ${PROJECTION_LAYOUT_CLASS_NAMES[layout].container}`}
    >
      {children}
    </div>
  );
};

export default VotingWidgetRewardsProjectionContainer;
