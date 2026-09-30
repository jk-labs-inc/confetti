import { useReducedMotion } from "motion/react";
import { FC } from "react";
import ConfettiBurst from "./ConfettiBurst";
import ConfettiDrift from "./ConfettiDrift";

const WinnerConfetti: FC = () => {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return null;

  return (
    <>
      <ConfettiBurst />
      <ConfettiDrift />
    </>
  );
};

export default WinnerConfetti;
