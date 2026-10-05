import { CSSProperties, FC } from "react";
import { LandedConfettiPiece } from "./confetti";

interface ConfettiPieceProps {
  piece: LandedConfettiPiece;
}

const ConfettiPiece: FC<ConfettiPieceProps> = ({ piece }) => (
  <img
    src={piece.src}
    width={piece.sizePx}
    height={piece.sizePx}
    alt=""
    draggable={false}
    className="empty-stage-confetti pointer-events-none absolute block"
    style={
      {
        left: `calc(50% + ${piece.offsetXPx}px)`,
        bottom: piece.restYPx,
        marginLeft: -piece.sizePx / 2,
        "--from-x": `${piece.fromXPx}px`,
        "--from-y": `${piece.fromYPx}px`,
        "--spin": `${piece.spinDeg}deg`,
        "--delay": `${piece.delayS}s`,
        "--duration": `${piece.durationS}s`,
      } as CSSProperties
    }
  />
);

export default ConfettiPiece;
