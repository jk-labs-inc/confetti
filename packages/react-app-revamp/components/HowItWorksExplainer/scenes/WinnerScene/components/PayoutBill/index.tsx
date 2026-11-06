import FlyingBill from "@components/HowItWorksExplainer/actors/FlyingBill";
import { useBillFlight } from "@components/HowItWorksExplainer/actors/FlyingBill/useBillFlight";
import { PAY_FLIGHT_S, payoutBillPoint } from "@components/HowItWorksExplainer/scenes/WinnerScene/beats";
import type { PayoutBeats } from "@components/HowItWorksExplainer/scenes/WinnerScene/types";
import { formatDemoDollars } from "lib/howItWorks/demo";
import { type MotionValue } from "motion/react";
import { FC } from "react";

interface PayoutBillProps {
  index: number;
  beat: PayoutBeats;
  time: MotionValue<number>;
}

const BILL_LEAD_S = 0.1;
const BILL_SWING_DEG = 20;
const BILL_SHRINK = 0.2;

const PayoutBill: FC<PayoutBillProps> = ({ index, beat, time }) => {
  const bill = useBillFlight(time, {
    launchAt: beat.launchAt,
    flightS: PAY_FLIGHT_S,
    leadS: BILL_LEAD_S,
    swingDeg: BILL_SWING_DEG,
    shrink: BILL_SHRINK,
    pointAt: p => payoutBillPoint(index, p),
  });

  return (
    <FlyingBill
      label={`+${formatDemoDollars(Math.round(beat.voter.payout))}`}
      x={bill.x}
      y={bill.y}
      rotate={bill.rotate}
      scale={bill.scale}
      opacity={bill.opacity}
    />
  );
};

export default PayoutBill;
