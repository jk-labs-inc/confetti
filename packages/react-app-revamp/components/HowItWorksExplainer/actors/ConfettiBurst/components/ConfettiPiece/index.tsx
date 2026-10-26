import {
  CONFETTI_FADE_S,
  CONFETTI_GRAVITY_PX_PER_S2,
  CONFETTI_LIFETIME_S,
  type ConfettiPieceSpec,
} from "@components/HowItWorksExplainer/actors/ConfettiBurst/pieces";
import { motion, useTransform, type MotionValue } from "motion/react";
import { FC } from "react";

interface ConfettiPieceProps {
  piece: ConfettiPieceSpec;
  elapsed: MotionValue<number>;
  originX: number;
  originY: number;
}

const ConfettiPiece: FC<ConfettiPieceProps> = ({ piece, elapsed, originX, originY }) => {
  const x = useTransform(elapsed, t => originX + Math.cos(piece.angle) * piece.speed * Math.max(0, t));
  const y = useTransform(elapsed, t => {
    const s = Math.max(0, t);
    return originY + Math.sin(piece.angle) * piece.speed * s + 0.5 * CONFETTI_GRAVITY_PX_PER_S2 * s * s;
  });
  const rotate = useTransform(elapsed, t => piece.spin * Math.max(0, t));
  const opacity = useTransform(elapsed, t =>
    t < 0 || t > CONFETTI_LIFETIME_S ? 0 : Math.min(1, (CONFETTI_LIFETIME_S - t) / CONFETTI_FADE_S),
  );

  return (
    <motion.span
      className="absolute left-0 top-0 rounded-[1px]"
      style={{
        x,
        y,
        rotate,
        opacity,
        width: piece.isStrip ? 3 : 6,
        height: piece.isStrip ? 9 : 6,
        background: piece.color,
      }}
    />
  );
};

export default ConfettiPiece;
