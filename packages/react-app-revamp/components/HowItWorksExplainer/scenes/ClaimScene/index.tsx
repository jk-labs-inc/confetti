import ConfettiBurst from "@components/HowItWorksExplainer/actors/ConfettiBurst";
import FlyingBill from "@components/HowItWorksExplainer/actors/FlyingBill";
import { useBillFlight } from "@components/HowItWorksExplainer/actors/FlyingBill/useBillFlight";
import TapRing from "@components/HowItWorksExplainer/actors/TapRing";
import VotesGainedTag from "@components/HowItWorksExplainer/actors/VotesGainedTag";
import { useSceneClock } from "@components/HowItWorksExplainer/engine";
import {
  BILL_FLIGHT_S,
  BUTTON_TAP_POINT,
  CARD_CENTER,
  CLAIM_BEATS,
  billPoint,
} from "@components/HowItWorksExplainer/scenes/ClaimScene/beats";
import ClaimCard from "@components/HowItWorksExplainer/scenes/ClaimScene/components/ClaimCard";
import ClaimVoteButton from "@components/HowItWorksExplainer/scenes/ClaimScene/components/ClaimVoteButton";
import type { SceneProps } from "@components/HowItWorksExplainer/types";
import { formatDemoDollars } from "lib/howItWorks/demo";
import { FC } from "react";

const BILL_LEAD_S = 0.13;
const BILL_SWING_DEG = 24;
const BILL_SHRINK = 0.3;
const TAG_TOP_PX = CARD_CENTER.y - 12;

const ClaimScene: FC<SceneProps> = ({ script }) => {
  const { claim } = script;
  const entry = script.entries.find(candidate => candidate.id === claim.entryId) ?? script.entries[0];
  const time = useSceneClock(CLAIM_BEATS);
  const bill = useBillFlight(time, {
    launchAt: CLAIM_BEATS.launchAt,
    flightS: BILL_FLIGHT_S,
    leadS: BILL_LEAD_S,
    swingDeg: BILL_SWING_DEG,
    shrink: BILL_SHRINK,
    pointAt: billPoint,
  });

  return (
    <>
      <ClaimCard entry={entry} claimedVotes={claim.votes} time={time} />
      <ClaimVoteButton time={time} />
      <TapRing at={BUTTON_TAP_POINT} time={time} pressAt={CLAIM_BEATS.pressAt} />
      <FlyingBill
        label={`+${formatDemoDollars(claim.spend)}`}
        x={bill.x}
        y={bill.y}
        rotate={bill.rotate}
        scale={bill.scale}
        opacity={bill.opacity}
      />
      <VotesGainedTag
        votes={claim.votes}
        centerX={CARD_CENTER.x}
        top={TAG_TOP_PX}
        time={time}
        startAt={CLAIM_BEATS.landAt}
      />
      <ConfettiBurst time={time} startS={CLAIM_BEATS.landAt} originX={CARD_CENTER.x} originY={CARD_CENTER.y} />
    </>
  );
};

export default ClaimScene;
