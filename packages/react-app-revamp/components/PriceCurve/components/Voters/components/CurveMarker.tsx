import { entryMedal } from "@helpers/entryColors";
import { clamp } from "lodash";
import { FC, useId, useMemo } from "react";
import { MARKER_ANCHOR_R, MARKER_AVATAR_R } from "../constants";
import useVoterRibbonStore from "../store";
import { PositionedVote } from "../types";
import VoterAvatar from "./VoterAvatar";

interface CurveMarkerProps {
  positioned: PositionedVote[];
  rankById: Map<string, number>;
  chartWidth: number;
  chartHeight: number;
}

const CurveMarker: FC<CurveMarkerProps> = ({ positioned, rankById, chartWidth, chartHeight }) => {
  const activeVoteUuid = useVoterRibbonStore(state => state.activeVoteUuid);
  const byUuid = useMemo(() => new Map(positioned.map(v => [v.uuid, v])), [positioned]);
  const rawId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const pingName = `ribping-${rawId}`;
  const gradId = `ribgrad-${rawId}`;

  if (positioned.length === 0 || chartWidth <= 0 || chartHeight <= 0) return null;

  const active = activeVoteUuid ? byUuid.get(activeVoteUuid) : undefined;
  if (!active) return null;

  const medal = entryMedal(rankById.get(active.proposalId));
  const color = `url(#${gradId})`;
  const ax = clamp(active.x, 0, chartWidth);
  const ay = clamp(active.y, 6, chartHeight - 6);
  const bx = clamp(ax, 16, chartWidth - 16);
  const by = clamp(ay > 44 ? ay - 26 : ay + 26, 16, chartHeight - 16);

  return (
    <g pointerEvents="none">
      <style>{`@keyframes ${pingName}{0%{transform:scale(.55);opacity:.6}100%{transform:scale(2.4);opacity:0}}`}</style>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          {medal.stops.map(stop => (
            <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
          ))}
        </linearGradient>
      </defs>

      <line x1={ax} y1={ay} x2={bx} y2={by} stroke={medal.solid} strokeWidth={1} opacity={0.5} />

      <circle cx={ax} cy={ay} r={8} fill={color} opacity={0.14} />
      <circle
        cx={ax}
        cy={ay}
        r={5}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        opacity={0.6}
        style={{ transformBox: "fill-box", transformOrigin: "center", animation: `${pingName} 1.9s ease-out infinite` }}
      />
      <circle cx={ax} cy={ay} r={MARKER_ANCHOR_R} fill={color} stroke="#000" strokeWidth={1.5} />

      <circle cx={bx} cy={by} r={MARKER_AVATAR_R} fill="#1e1e1e" stroke={color} strokeWidth={2} />
      <VoterAvatar address={active.userAddress} clipKey={`mk-${active.uuid}`} cx={bx} cy={by} r={MARKER_AVATAR_R - 2} />
    </g>
  );
};

export default CurveMarker;
