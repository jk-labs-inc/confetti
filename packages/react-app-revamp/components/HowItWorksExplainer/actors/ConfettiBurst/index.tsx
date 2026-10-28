import ConfettiPiece from "@components/HowItWorksExplainer/actors/ConfettiBurst/components/ConfettiPiece";
import { confettiPieces } from "@components/HowItWorksExplainer/actors/ConfettiBurst/pieces";
import { useTransform, type MotionValue } from "motion/react";
import { FC } from "react";

interface ConfettiBurstProps {
  time: MotionValue<number>;
  startS: number;
  originX: number;
  originY: number;
}

const CONFETTI_PIECES = confettiPieces(28);

const ConfettiBurst: FC<ConfettiBurstProps> = ({ time, startS, originX, originY }) => {
  const elapsed = useTransform(time, t => t - startS);

  return (
    <>
      {CONFETTI_PIECES.map((piece, i) => (
        <ConfettiPiece key={i} piece={piece} elapsed={elapsed} originX={originX} originY={originY} />
      ))}
    </>
  );
};

export default ConfettiBurst;
