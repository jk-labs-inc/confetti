import { STAGE_HEIGHT_PX, STAGE_STYLE, STAGE_WIDTH_PX, type SceneProps } from "@components/HowItWorksExplainer/engine";
import { formatNumberWithCommas } from "@helpers/formatNumber";
import { FC } from "react";

const PADDING_PX = { top: 24, right: 20, bottom: 28, left: 20 };
const PLOT_WIDTH_PX = STAGE_WIDTH_PX - PADDING_PX.left - PADDING_PX.right;
const PLOT_HEIGHT_PX = STAGE_HEIGHT_PX - PADDING_PX.top - PADDING_PX.bottom;
const LABEL_EDGE_PX = 36;
const LABEL_GAP_PX = 12;

const CurveStill: FC<SceneProps> = ({ script }) => {
  const { points, sameSpendBuys } = script.curve;
  const maxPrice = Math.max(...points.map(point => point.pricePerVote));
  const toX = (percentThrough: number) => PADDING_PX.left + (percentThrough / 100) * PLOT_WIDTH_PX;
  const toY = (price: number) => PADDING_PX.top + PLOT_HEIGHT_PX - (price / maxPrice) * PLOT_HEIGHT_PX;
  const path = points
    .map((point, i) => `${i === 0 ? "M" : "L"}${toX(point.percentThrough)},${toY(point.pricePerVote)}`)
    .join(" ");

  return (
    <div style={STAGE_STYLE} className="relative" aria-hidden>
      <svg width={STAGE_WIDTH_PX} height={STAGE_HEIGHT_PX} className="absolute inset-0 overflow-visible">
        <path d={path} fill="none" stroke="var(--color-secondary-11)" strokeWidth={3} strokeLinecap="round" />
        {sameSpendBuys.map(buy => (
          <circle
            key={buy.percentThrough}
            cx={toX(buy.percentThrough)}
            cy={toY(buy.pricePerVote)}
            r={5}
            fill="var(--color-primary-10)"
          />
        ))}
      </svg>
      {sameSpendBuys.map(buy => {
        const x = toX(buy.percentThrough);
        const y = toY(buy.pricePerVote);
        const isBesideDot = x > STAGE_WIDTH_PX / 2;
        return (
          <div
            key={buy.percentThrough}
            className={`absolute flex flex-col ${isBesideDot ? "items-end text-right" : "-translate-x-1/2 items-center text-center"}`}
            style={
              isBesideDot
                ? { right: STAGE_WIDTH_PX - x + LABEL_GAP_PX, top: y - LABEL_GAP_PX }
                : { left: Math.max(x, LABEL_EDGE_PX), top: y - 44 }
            }
          >
            <span className="text-[14px] font-bold leading-none text-neutral-11">
              {formatNumberWithCommas(buy.votes)}
            </span>
            <span className="text-[10px] text-neutral-9">votes for ${buy.spend}</span>
          </div>
        );
      })}
      <span className="absolute text-[11px] text-neutral-9" style={{ left: PADDING_PX.left, bottom: 4 }}>
        start
      </span>
      <span className="absolute text-[11px] text-neutral-9" style={{ right: PADDING_PX.right, bottom: 4 }}>
        end
      </span>
    </div>
  );
};

export default CurveStill;
