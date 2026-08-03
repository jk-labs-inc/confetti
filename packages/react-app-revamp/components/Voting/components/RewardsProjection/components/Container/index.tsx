import { FC } from "react";

interface VotingWidgetRewardsProjectionContainerProps {
  children: React.ReactNode;
}

const VotingWidgetRewardsProjectionContainer: FC<VotingWidgetRewardsProjectionContainerProps> = ({ children }) => {
  return (
    <div className="flex items-center gap-4 bg-transparent rounded-2xl border border-neutral-17 py-3 pl-4 pr-6">
      {children}
    </div>
  );
};

export default VotingWidgetRewardsProjectionContainer;
