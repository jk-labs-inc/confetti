import Drawer from "@components/UI/Drawer";
import { FC, useEffect, useMemo, useState } from "react";
import { clusterKey } from "./buildAvatarClusters";
import { buildEntryColors } from "./entryColors";
import { AvatarCluster } from "./types";
import VoterClusterContent from "./VoterClusterContent";

interface VoterClusterDrawerProps {
  clusters: AvatarCluster[];
  selectedKey: string | null;
  onClose: () => void;
  formatPrice: (nativePrice: number) => string;
  entryTitlesById: Map<string, string>;
}

const VoterClusterDrawer: FC<VoterClusterDrawerProps> = ({
  clusters,
  selectedKey,
  onClose,
  formatPrice,
  entryTitlesById,
}) => {
  const clustersByKey = useMemo(() => {
    const map = new Map<string, AvatarCluster>();
    for (const cluster of clusters) map.set(clusterKey(cluster), cluster);
    return map;
  }, [clusters]);

  const entryColorsById = useMemo(
    () => buildEntryColors(clusters.flatMap(cluster => cluster.voters.map(voter => voter.proposalId))),
    [clusters],
  );

  const selectedCluster = selectedKey ? (clustersByKey.get(selectedKey) ?? null) : null;

  const [shownCluster, setShownCluster] = useState<AvatarCluster | null>(null);

  useEffect(() => {
    if (selectedCluster) setShownCluster(selectedCluster);
  }, [selectedCluster]);

  return (
    <Drawer isOpen={!!selectedCluster} onClose={onClose} className="bg-true-black">
      <div className="px-6 pb-8 pt-1">
        {shownCluster && (
          <VoterClusterContent
            cluster={shownCluster}
            formatPrice={formatPrice}
            entryTitlesById={entryTitlesById}
            entryColorsById={entryColorsById}
          />
        )}
      </div>
    </Drawer>
  );
};

export default VoterClusterDrawer;
