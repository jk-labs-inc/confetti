import Tooltip from "@components/UI/Tooltip";
import { FC, useMemo } from "react";
import { clusterKey } from "./buildAvatarClusters";
import { VOTER_AVATARS_TOOLTIP_ID } from "./constants";
import { buildEntryColors } from "./entryColors";
import { AvatarCluster } from "./types";
import VoterClusterContent from "./VoterClusterContent";

interface VoterAvatarTooltipProps {
  clusters: AvatarCluster[];
  formatPrice: (nativePrice: number) => string;
  entryTitlesById: Map<string, string>;
}

const VoterAvatarTooltip: FC<VoterAvatarTooltipProps> = ({ clusters, formatPrice, entryTitlesById }) => {
  const clustersByKey = useMemo(() => {
    const map = new Map<string, AvatarCluster>();
    for (const cluster of clusters) map.set(clusterKey(cluster), cluster);
    return map;
  }, [clusters]);

  const entryColorsById = useMemo(
    () => buildEntryColors(clusters.flatMap(cluster => cluster.voters.map(voter => voter.proposalId))),
    [clusters],
  );

  return (
    <Tooltip
      id={VOTER_AVATARS_TOOLTIP_ID}
      panel
      place="top"
      positionStrategy="fixed"
      offset={12}
      className="max-w-[380px]!"
      render={({ activeAnchor }) => {
        const key = activeAnchor?.getAttribute("data-cluster-key");
        if (!key) return null;
        const cluster = clustersByKey.get(key);
        if (!cluster) return null;
        return (
          <VoterClusterContent
            cluster={cluster}
            formatPrice={formatPrice}
            entryTitlesById={entryTitlesById}
            entryColorsById={entryColorsById}
          />
        );
      }}
    />
  );
};

export default VoterAvatarTooltip;
