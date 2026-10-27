import FlyingBill from "@components/HowItWorksExplainer/actors/FlyingBill";
import { BILL_TILT_DEG, useBillFlight } from "@components/HowItWorksExplainer/actors/FlyingBill/useBillFlight";
import { bump, isWithin } from "@components/HowItWorksExplainer/clock";
import {
  BILL_FLIGHT_S,
  BILL_SPLIT_PROGRESS,
  billPoint,
  cardCenterX,
} from "@components/HowItWorksExplainer/scenes/PoolScene/beats";
import VotesGainedTag from "@components/HowItWorksExplainer/scenes/PoolScene/components/VotesGainedTag";
import { CARD_TOP_PX } from "@components/HowItWorksExplainer/scenes/potStage";
import { ENTRY_CARD_SIZE_PX } from "@components/HowItWorksExplainer/realProps";
import type { DepositBeats } from "@components/HowItWorksExplainer/scenes/PoolScene/types";
import { formatDemoDollars } from "lib/howItWorks/demo";
import { useTransform, type MotionValue } from "motion/react";
import { FC } from "react";

interface PoolDepositProps {
  beat: DepositBeats;
  time: MotionValue<number>;
}

const TAG_TOP_PX = CARD_TOP_PX + ENTRY_CARD_SIZE_PX / 2 - 12;
const BILL_LEAD_S = 0.13;
const BILL_SWING_DEG = 24;
const BILL_SHRINK = 0.3;
const SPLIT_POP = 0.15;
const FEE_S = 0.6;
const FEE_DRIFT = { x: 64, rise: 26, fall: 52 };
const FEE_SPIN_DEG = 50;
const FEE_SCALE = 0.9;

const PoolDeposit: FC<PoolDepositProps> = ({ beat, time }) => {
  const { deposit, entryIndex } = beat;
  const bill = useBillFlight(time, {
    launchAt: beat.launchAt,
    flightS: BILL_FLIGHT_S,
    leadS: BILL_LEAD_S,
    swingDeg: BILL_SWING_DEG,
    shrink: BILL_SHRINK,
    pointAt: p => billPoint(entryIndex, p),
  });
  const billScale = useTransform(() => bill.scale.get() * bump(time.get(), beat.splitAt, SPLIT_POP));
  const spendLabel = `+${formatDemoDollars(deposit.spend)}`;
  const toPoolLabel = formatDemoDollars(deposit.toPool);
  const billLabel = useTransform(bill.flight, p => (p >= BILL_SPLIT_PROGRESS ? toPoolLabel : spendLabel));

  const splitPoint = billPoint(entryIndex, BILL_SPLIT_PROGRESS);
  const fee = useTransform(time, t => (t - beat.splitAt) / FEE_S);
  const feeX = useTransform(fee, p => splitPoint.x + FEE_DRIFT.x * p);
  const feeY = useTransform(fee, p => splitPoint.y - FEE_DRIFT.rise * p + FEE_DRIFT.fall * p * p);
  const feeRotate = useTransform(fee, p => BILL_TILT_DEG + FEE_SPIN_DEG * p);
  const feeOpacity = useTransform(fee, p => (isWithin(p) ? 1 - p : 0));

  return (
    <>
      <VotesGainedTag
        votes={deposit.votes}
        centerX={cardCenterX(entryIndex)}
        top={TAG_TOP_PX}
        time={time}
        startAt={beat.launchAt}
      />
      <FlyingBill
        label={billLabel}
        x={bill.x}
        y={bill.y}
        rotate={bill.rotate}
        scale={billScale}
        opacity={bill.opacity}
      />
      <FlyingBill
        label={formatDemoDollars(deposit.skimmed)}
        tone="fee"
        x={feeX}
        y={feeY}
        rotate={feeRotate}
        scale={FEE_SCALE}
        opacity={feeOpacity}
      />
    </>
  );
};

export default PoolDeposit;
