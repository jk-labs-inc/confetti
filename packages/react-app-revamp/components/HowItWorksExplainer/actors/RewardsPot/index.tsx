import PotPileItem from "@components/HowItWorksExplainer/actors/RewardsPot/components/PotPileItem";
import {
  PILE_LAYERS,
  PILE_STAGGER_S,
  type PileLayerTiming,
  POT_BODY_PATH,
  POT_HEIGHT_PX,
  POT_LABEL_BOTTOM_PX,
  POT_LABEL_TOP_PX,
  POT_LIP_PATH,
  POT_RIM,
  POT_SHINE_PATH,
  POT_WIDTH_PX,
} from "@components/HowItWorksExplainer/actors/RewardsPot/geometry";
import { motion, type MotionStyle, type MotionValue } from "motion/react";
import { FC } from "react";

interface RewardsPotProps {
  time: MotionValue<number>;
  amountLabel: MotionValue<string>;
  layers: readonly PileLayerTiming[];
  style?: MotionStyle;
}

const RewardsPot: FC<RewardsPotProps> = ({ time, amountLabel, layers, style }) => (
  <motion.div style={{ width: POT_WIDTH_PX, height: POT_HEIGHT_PX, ...style }} className="absolute">
    <svg width={POT_WIDTH_PX} height={POT_HEIGHT_PX} className="absolute inset-0 overflow-visible">
      <ellipse
        cx={POT_RIM.cx}
        cy={POT_RIM.cy}
        rx={POT_RIM.rx}
        ry={POT_RIM.ry}
        fill="var(--color-true-black)"
        stroke="var(--color-primary-10)"
        strokeOpacity={0.6}
        strokeWidth={2}
      />
      {PILE_LAYERS.slice(0, layers.length).map((layer, k) =>
        layer.map((item, i) => (
          <PotPileItem
            key={`${k}-${i}`}
            item={item}
            time={time}
            landAt={layers[k].landAt === null ? null : layers[k].landAt + i * PILE_STAGGER_S}
            leaveAt={layers[k].leaveAt}
          />
        )),
      )}
      <path d={POT_BODY_PATH} fill="var(--color-neutral-2)" stroke="var(--color-primary-10)" strokeOpacity={0.6} strokeWidth={2} />
      <path d={POT_SHINE_PATH} fill="none" stroke="white" strokeOpacity={0.08} strokeWidth={4} strokeLinecap="round" />
      <path d={POT_LIP_PATH} fill="none" stroke="var(--color-primary-10)" strokeWidth={3.5} strokeLinecap="round" />
    </svg>
    <div
      className="absolute inset-x-0 flex flex-col items-center justify-center"
      style={{ top: POT_LABEL_TOP_PX, bottom: POT_LABEL_BOTTOM_PX }}
    >
      <span className="text-[10px] font-bold leading-tight text-neutral-9">rewards pool</span>
      <motion.span className="text-[24px] font-bold leading-none text-neutral-11">{amountLabel}</motion.span>
    </div>
  </motion.div>
);

export default RewardsPot;
