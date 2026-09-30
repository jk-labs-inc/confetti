import { FC } from "react";
import WinnerBadge from "./WinnerBadge";
import WinnerConfetti from "./WinnerConfetti";
import WinnerRing from "./WinnerRing";

const WinnerCelebration: FC = () => (
  <>
    <WinnerRing />
    <WinnerBadge />
    <WinnerConfetti />
  </>
);

export default WinnerCelebration;
