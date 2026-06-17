import { FC, memo, useMemo, useState } from "react";
import { clusterKey } from "./buildAvatarClusters";
import {
  AVATAR_RADIUS,
  BADGE_BG,
  BADGE_FG,
  BADGE_RADIUS,
  HOVER_SCALE,
  MAX_VISIBLE_AVATARS,
  STACK_STEP,
  VOTER_AVATARS_TOOLTIP_ID,
} from "./constants";
import { AvatarCluster } from "./types";
import VoterAvatar from "./VoterAvatar";

interface VoterAvatarStripProps {
  clusters: AvatarCluster[];
  centerY: number;
}

interface ClusterGeometry {
  cluster: AvatarCluster;
  key: string;
  xs: number[];
  visibleVoters: AvatarCluster["voters"];
  overflow: number;
  badgeCx: number;
  left: number;
  right: number;
}

const computeGeometry = (cluster: AvatarCluster): ClusterGeometry => {
  const r = AVATAR_RADIUS;
  const count = cluster.voters.length;
  const visible = Math.min(count, MAX_VISIBLE_AVATARS);
  // Show the most recent faces (a freshly cast vote shows its avatar), newest painted on top.
  const visibleVoters = cluster.voters.slice(-visible);
  const xs = visibleVoters.map((_, i) => cluster.x + (i - (visible - 1) / 2) * STACK_STEP);
  const avatarRight = xs[xs.length - 1] + r;
  const overflow = count - visible;
  const badgeCx = avatarRight + BADGE_RADIUS;
  const left = xs[0] - r - 2;
  const right = (overflow > 0 ? badgeCx + BADGE_RADIUS : avatarRight) + 2;
  return { cluster, key: clusterKey(cluster), xs, visibleVoters, overflow, badgeCx, left, right };
};

const VoterAvatarStrip: FC<VoterAvatarStripProps> = ({ clusters, centerY }) => {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const geometries = useMemo(() => clusters.map(computeGeometry), [clusters]);

  if (geometries.length === 0) return null;

  const renderVisual = (geo: ClusterGeometry) => {
    const hovered = geo.key === hoveredKey;
    const transform = hovered
      ? `translate(${geo.cluster.x} ${centerY}) scale(${HOVER_SCALE}) translate(${-geo.cluster.x} ${-centerY})`
      : undefined;

    return (
      <g key={geo.key} transform={transform} pointerEvents="none">
        {geo.visibleVoters.map((voter, i) => (
          <VoterAvatar key={voter.uuid} vote={voter} cx={geo.xs[i]} cy={centerY} r={AVATAR_RADIUS} />
        ))}
        {geo.overflow > 0 && (
          <>
            <circle
              cx={geo.badgeCx}
              cy={centerY}
              r={BADGE_RADIUS}
              fill={BADGE_BG}
              stroke={BADGE_FG}
              strokeWidth={1.5}
            />
            <text
              x={geo.badgeCx}
              y={centerY}
              fill={BADGE_FG}
              fontSize={9}
              fontWeight={700}
              textAnchor="middle"
              dominantBaseline="central"
            >
              +{geo.overflow}
            </text>
          </>
        )}
      </g>
    );
  };

  const renderHit = (geo: ClusterGeometry) => {
    const halfWidth = (geo.right - geo.left) / 2;
    const extraX = halfWidth * (HOVER_SCALE - 1) + 2;
    const halfHeight = AVATAR_RADIUS * HOVER_SCALE + 3;

    return (
      <rect
        key={geo.key}
        x={geo.left - extraX}
        y={centerY - halfHeight}
        width={geo.right - geo.left + extraX * 2}
        height={halfHeight * 2}
        fill="transparent"
        data-tooltip-id={VOTER_AVATARS_TOOLTIP_ID}
        data-cluster-key={geo.key}
        style={{ pointerEvents: "all", cursor: "pointer" }}
        onMouseEnter={() => setHoveredKey(geo.key)}
        onMouseLeave={() => setHoveredKey(null)}
      />
    );
  };

  const orderedVisuals =
    hoveredKey == null
      ? geometries
      : [...geometries.filter(geo => geo.key !== hoveredKey), ...geometries.filter(geo => geo.key === hoveredKey)];

  return (
    <>
      {orderedVisuals.map(renderVisual)}
      {geometries.map(renderHit)}
    </>
  );
};

export default memo(VoterAvatarStrip);
