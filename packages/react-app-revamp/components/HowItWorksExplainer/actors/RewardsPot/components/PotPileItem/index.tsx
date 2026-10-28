import { PILE_DROP_PX, PILE_LEAVE_S, PILE_LIFT_PX } from "@components/HowItWorksExplainer/actors/RewardsPot/geometry";
import type { PileItem } from "@components/HowItWorksExplainer/actors/RewardsPot/types";
import { clampedInterpolate, popSpring } from "@components/HowItWorksExplainer/clock";
import { motion, useTransform, type MotionValue } from "motion/react";
import { FC } from "react";

interface PotPileItemProps {
  item: PileItem;
  time: MotionValue<number>;
  landAt: number | null;
  leaveAt: number | null;
}

const COIN_EDGE_COLOR = "#A8860A";
const BILL_COLORS = { fill: "#F7C9BE", stroke: "#C98579", text: "#7A3B30" };

const leaveProgress = (t: number, leaveAt: number | null) =>
  leaveAt === null ? 0 : clampedInterpolate(t, [leaveAt, leaveAt + PILE_LEAVE_S], [0, 1]);

const PotPileItem: FC<PotPileItemProps> = ({ item, time, landAt, leaveAt }) => {
  const y = useTransform(time, t => {
    const drop = landAt === null ? 0 : -PILE_DROP_PX * (1 - popSpring(t, landAt));
    return drop - PILE_LIFT_PX * leaveProgress(t, leaveAt);
  });
  const opacity = useTransform(time, t => (landAt !== null && t < landAt ? 0 : 1 - leaveProgress(t, leaveAt)));

  return (
    <g transform={`translate(${item.x} ${item.y})`}>
      <motion.g style={{ y, opacity }}>
        <g transform={`rotate(${item.rotate})`}>
          {item.kind === "coin" ? (
            <>
              <ellipse cy={2} rx={8} ry={3.2} fill={COIN_EDGE_COLOR} />
              <ellipse rx={8} ry={3.2} fill="var(--color-primary-10)" stroke={COIN_EDGE_COLOR} strokeWidth={0.75} />
            </>
          ) : (
            <>
              <rect
                x={-11}
                y={-5.5}
                width={22}
                height={11}
                rx={1.5}
                fill={BILL_COLORS.fill}
                stroke={BILL_COLORS.stroke}
              />
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={8}
                fontWeight={700}
                fill={BILL_COLORS.text}
              >
                $
              </text>
            </>
          )}
        </g>
      </motion.g>
    </g>
  );
};

export default PotPileItem;
