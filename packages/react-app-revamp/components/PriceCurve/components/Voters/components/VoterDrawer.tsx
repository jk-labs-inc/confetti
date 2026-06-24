import Drawer from "@components/UI/Drawer";
import { FC, useEffect, useState } from "react";
import VoterClusterContent from "../detail/VoterClusterContent";
import { PositionedVote } from "../types";

interface VoterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  voters: PositionedVote[];
  formatPrice: (nativePrice: number) => string;
  entryTitlesById: Map<string, string>;
  rankById: Map<string, number>;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

const VoterDrawer: FC<VoterDrawerProps> = ({
  isOpen,
  onClose,
  voters,
  formatPrice,
  entryTitlesById,
  rankById,
  onLoadMore,
  hasMore,
  isLoadingMore,
}) => {
  const [shown, setShown] = useState<PositionedVote[]>(voters);
  useEffect(() => {
    if (voters.length) setShown(voters);
  }, [voters]);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} className="bg-true-black">
      <div className="px-6 pb-8 pt-1">
        <VoterClusterContent
          cluster={{ voters: shown }}
          formatPrice={formatPrice}
          entryTitlesById={entryTitlesById}
          rankById={rankById}
          onLoadMore={onLoadMore}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
        />
      </div>
    </Drawer>
  );
};

export default VoterDrawer;
