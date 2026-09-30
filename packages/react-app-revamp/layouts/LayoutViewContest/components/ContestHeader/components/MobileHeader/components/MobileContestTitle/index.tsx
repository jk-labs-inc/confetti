import { useFitText } from "@hooks/useFitText";
import { FC, ReactNode, useRef } from "react";

interface MobileContestTitleProps {
  contestName: string;
  isCanceled: boolean;
  trailing?: ReactNode;
}

const TITLE_MIN_PX = 15;
const TITLE_MAX_PX = 20;

const MobileContestTitle: FC<MobileContestTitleProps> = ({ contestName, isCanceled, trailing }) => {
  const titleRef = useRef<HTMLParagraphElement>(null);
  const fontSize = useFitText(titleRef, contestName, { min: TITLE_MIN_PX, max: TITLE_MAX_PX });
  const wrapsAtMin = fontSize <= TITLE_MIN_PX;

  return (
    <div className="flex items-center gap-2 min-w-0">
      <p
        ref={titleRef}
        className={`min-w-0 text-neutral-11 font-sabo-filled ${wrapsAtMin ? "line-clamp-2" : "whitespace-nowrap"} ${isCanceled ? "line-through" : ""}`}
        style={{ fontSize: `${fontSize}px` }}
      >
        {contestName}
      </p>
      {trailing}
    </div>
  );
};

export default MobileContestTitle;
