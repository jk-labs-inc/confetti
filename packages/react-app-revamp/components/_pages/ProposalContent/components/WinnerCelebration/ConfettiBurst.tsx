import { motion } from "motion/react";
import { FC } from "react";
import { WINNER_BURST_PIECES } from "./confetti";

const BURST_RISE_AT = 0.3;

const ConfettiBurst: FC = () => (
  <span className="pointer-events-none absolute inset-0 z-20 overflow-visible" aria-hidden="true">
    {WINNER_BURST_PIECES.map(piece => (
      <motion.img
        key={piece.index}
        src={piece.src}
        width={piece.size}
        height={piece.size}
        alt=""
        draggable={false}
        className="absolute top-0 block"
        style={{ left: `${piece.leftPct}%`, marginLeft: -piece.size / 2, willChange: "transform, opacity" }}
        initial={{ x: 0, y: 0, rotate: 0, opacity: 0 }}
        animate={{
          x: [0, piece.driftX * 0.6, piece.driftX],
          y: [0, piece.riseY, piece.fallY],
          rotate: [0, piece.spinDeg],
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          delay: piece.delay,
          duration: piece.duration,
          x: { duration: piece.duration, times: [0, BURST_RISE_AT, 1], ease: "easeOut" },
          y: { duration: piece.duration, times: [0, BURST_RISE_AT, 1], ease: ["easeOut", "easeIn"] },
          rotate: { duration: piece.duration, ease: "linear" },
          opacity: { duration: piece.duration, times: [0, 0.08, 0.75, 1] },
        }}
      />
    ))}
  </span>
);

export default ConfettiBurst;
