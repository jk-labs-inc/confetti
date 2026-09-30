import Drawer from "@components/UI/Drawer";
import TabReveal from "@components/UI/TabReveal";
import { CSSProperties, FC, useLayoutEffect, useMemo, useState } from "react";
import ActivityList from "../MarketRail/components/ActivityList";
import MobileLeaderboard from "../MobileLeaderboard";
import SheetFooter from "./components/SheetFooter";
import SheetHeader from "./components/SheetHeader";
import SheetPriceCurve from "./components/SheetPriceCurve";
import {
  HALF_SHEET_BODY_HEIGHT,
  HALF_SHEET_SNAP,
  MarketSheetSegment,
  SHEET_CLASS_NAME,
  SHEET_CONTENT_HEIGHT,
  SHEET_SNAP_POINTS,
} from "./constants";
import { useSheetFit } from "./useSheetFit";

interface MobileMarketSheetProps {
  isOpen: boolean;
  segment: MarketSheetSegment;
  showLeaderboard: boolean;
  onSegmentChange: (segment: MarketSheetSegment) => void;
  onClose: () => void;
}

const FULL_BODY_HEIGHT = "100%";

const MobileMarketSheet: FC<MobileMarketSheetProps> = ({
  isOpen,
  segment: requestedSegment,
  showLeaderboard,
  onSegmentChange,
  onClose,
}) => {
  const segment =
    !showLeaderboard && requestedSegment === MarketSheetSegment.Leaderboard
      ? MarketSheetSegment.Activity
      : requestedSegment;
  const [activeSnapPoint, setActiveSnapPoint] = useState<number | string | null>(HALF_SHEET_SNAP);
  const { setBodyElement, setScrollElement, setContentElement, fitSnapPoint } = useSheetFit();
  const snapPoints = useMemo(() => (fitSnapPoint ? [fitSnapPoint] : SHEET_SNAP_POINTS), [fitSnapPoint]);

  useLayoutEffect(() => {
    if (isOpen) setActiveSnapPoint(snapPoints[0]);
  }, [isOpen, snapPoints]);

  const bodyStyle: CSSProperties = fitSnapPoint
    ? { maxHeight: HALF_SHEET_BODY_HEIGHT }
    : { height: activeSnapPoint === HALF_SHEET_SNAP ? HALF_SHEET_BODY_HEIGHT : FULL_BODY_HEIGHT };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={snapPoints}
      activeSnapPoint={activeSnapPoint}
      setActiveSnapPoint={setActiveSnapPoint}
      contentStyle={{ height: SHEET_CONTENT_HEIGHT, maxHeight: SHEET_CONTENT_HEIGHT }}
      className={SHEET_CLASS_NAME}
      handleSize="compact"
    >
      <div
        ref={setBodyElement}
        className="flex min-h-0 flex-col gap-3 px-4 pb-[env(safe-area-inset-bottom)]"
        style={bodyStyle}
      >
        <SheetHeader
          segment={segment}
          showLeaderboard={showLeaderboard}
          onSegmentChange={onSegmentChange}
          onClose={onClose}
        />
        <div
          ref={setScrollElement}
          className="no-scrollbar flex min-h-0 flex-auto flex-col overflow-y-auto overscroll-contain"
        >
          <TabReveal tabKey={segment} className="flex min-h-0 flex-1 flex-col">
            <div ref={setContentElement} className="pb-2">
              {segment === MarketSheetSegment.Leaderboard ? (
                <MobileLeaderboard />
              ) : segment === MarketSheetSegment.Activity ? (
                <ActivityList />
              ) : (
                <SheetPriceCurve />
              )}
            </div>
          </TabReveal>
        </div>
        {segment === MarketSheetSegment.Leaderboard ? <SheetFooter /> : null}
      </div>
    </Drawer>
  );
};

export default MobileMarketSheet;
