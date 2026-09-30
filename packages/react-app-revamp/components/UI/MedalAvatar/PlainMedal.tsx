import { FC, useId } from "react";
import {
  MEDAL_DISC_CENTER_X_PX,
  MEDAL_DISC_CENTER_Y_PX,
  MEDAL_DISC_DIAMETER_PX,
  MEDAL_IMAGE_HEIGHT_PX,
  MEDAL_IMAGE_WIDTH_PX,
  PLAIN_MEDAL_FACE_COLOR,
  PLAIN_MEDAL_RIBBON_LEFT_COLOR,
  PLAIN_MEDAL_RIBBON_RIGHT_COLOR,
  PLAIN_MEDAL_RIM_BOTTOM_COLOR,
  PLAIN_MEDAL_RIM_TOP_COLOR,
  PLAIN_MEDAL_RIM_WIDTH_PX,
} from "./constants";

interface PlainMedalProps {
  label: string;
  className?: string;
}

const LEFT_RIBBON_POINTS = "36,5.5 44.5,7 46,0 66,26.5 56,33.5";
const RIGHT_RIBBON_POINTS = "83,5.5 74.5,7 73,0 53,26.5 63,33.5";
const DISC_RADIUS_PX = MEDAL_DISC_DIAMETER_PX / 2;

const PlainMedal: FC<PlainMedalProps> = ({ label, className }) => {
  const rimGradientId = useId();

  return (
    <svg
      viewBox={`0 0 ${MEDAL_IMAGE_WIDTH_PX} ${MEDAL_IMAGE_HEIGHT_PX}`}
      role="img"
      aria-label={label}
      className={className}
    >
      <defs>
        <linearGradient id={rimGradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={PLAIN_MEDAL_RIM_TOP_COLOR} />
          <stop offset="1" stopColor={PLAIN_MEDAL_RIM_BOTTOM_COLOR} />
        </linearGradient>
      </defs>
      <polygon points={LEFT_RIBBON_POINTS} fill={PLAIN_MEDAL_RIBBON_LEFT_COLOR} />
      <polygon points={RIGHT_RIBBON_POINTS} fill={PLAIN_MEDAL_RIBBON_RIGHT_COLOR} />
      <circle
        cx={MEDAL_DISC_CENTER_X_PX}
        cy={MEDAL_DISC_CENTER_Y_PX}
        r={DISC_RADIUS_PX}
        fill={`url(#${rimGradientId})`}
      />
      <circle
        cx={MEDAL_DISC_CENTER_X_PX}
        cy={MEDAL_DISC_CENTER_Y_PX}
        r={DISC_RADIUS_PX - PLAIN_MEDAL_RIM_WIDTH_PX}
        fill={PLAIN_MEDAL_FACE_COLOR}
      />
    </svg>
  );
};

export default PlainMedal;
