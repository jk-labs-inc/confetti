import { CSSProperties, FC } from "react";
import { WINNER_DRIFT_PIECES } from "./confetti";

const ConfettiDrift: FC = () => (
  <span className="pointer-events-none absolute inset-0 z-20 overflow-visible" aria-hidden="true">
    {WINNER_DRIFT_PIECES.map(piece => (
      <img
        key={piece.index}
        src={piece.src}
        width={piece.size}
        height={piece.size}
        alt=""
        draggable={false}
        className="winner-confetti-drift absolute block"
        style={
          {
            left: `${piece.leftPct}%`,
            marginLeft: -piece.size / 2,
            "--sway": `${piece.swayPx}px`,
            "--spin": `${piece.spinDeg}deg`,
            "--duration": `${piece.durationS}s`,
            "--delay": `${piece.delayS}s`,
          } as CSSProperties
        }
      />
    ))}
  </span>
);

export default ConfettiDrift;
