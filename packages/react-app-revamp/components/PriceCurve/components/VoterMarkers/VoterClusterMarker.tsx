import FloatingSurface from "@components/UI/Tooltip/FloatingSurface";
import { useTooltip } from "@components/UI/Tooltip/useTooltip";
import { formatNumber } from "@helpers/formatNumber";
import { FC } from "react";
import { AVATAR_RADIUS, HOVER_SCALE } from "./constants";
import { AvatarCluster } from "./types";
import VoterClusterContent from "./VoterClusterContent";

interface VoterClusterMarkerProps {
  cluster: AvatarCluster;
  centerY: number;
  left: number;
  right: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formatPrice: (nativePrice: number) => string;
  entryTitlesById: Map<string, string>;
  entryColorsById: Map<string, string>;
}

const VoterClusterMarker: FC<VoterClusterMarkerProps> = ({
  cluster,
  centerY,
  left,
  right,
  open,
  onOpenChange,
  formatPrice,
  entryTitlesById,
  entryColorsById,
}) => {
  const tooltip = useTooltip({
    interactive: true,
    placement: "top",
    offsetPx: 12,
    open,
    onOpenChange,
    requireIntent: true,
  });

  const halfWidth = (right - left) / 2;
  const extraX = halfWidth * (HOVER_SCALE - 1) + 2;
  const halfHeight = AVATAR_RADIUS * HOVER_SCALE + 3;

  const voterCount = new Set(cluster.voters.map(voter => voter.userAddress.toLowerCase())).size;
  const totalVotes = cluster.voters.reduce((sum, voter) => sum + voter.voteAmount, 0);
  const ariaLabel = `${voterCount} ${voterCount === 1 ? "voter" : "voters"}, ${formatNumber(totalVotes)} votes`;

  return (
    <>
      <rect
        ref={tooltip.refs.setReference}
        {...tooltip.getReferenceProps()}
        x={left - extraX}
        y={centerY - halfHeight}
        width={right - left + extraX * 2}
        height={halfHeight * 2}
        fill="transparent"
        tabIndex={0}
        role="button"
        aria-label={ariaLabel}
        style={{ pointerEvents: "all", cursor: "pointer", outline: "none" }}
      />
      <FloatingSurface tooltip={tooltip} surface="panel" className="w-[420px]">
        <VoterClusterContent
          cluster={cluster}
          formatPrice={formatPrice}
          entryTitlesById={entryTitlesById}
          entryColorsById={entryColorsById}
        />
      </FloatingSurface>
    </>
  );
};

export default VoterClusterMarker;
