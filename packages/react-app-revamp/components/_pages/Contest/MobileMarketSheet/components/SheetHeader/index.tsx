import SegmentedControl, { SegmentedControlOption } from "@components/UI/SegmentedControl";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { FC } from "react";
import { MarketSheetSegment } from "../../constants";

const SEGMENT_OPTIONS: SegmentedControlOption<MarketSheetSegment>[] = [
  { value: MarketSheetSegment.Leaderboard, label: "leaderboard" },
  { value: MarketSheetSegment.Price, label: "price curve" },
  { value: MarketSheetSegment.Activity, label: "activity" },
];
const SEGMENT_OPTIONS_WITHOUT_LEADERBOARD = SEGMENT_OPTIONS.filter(
  option => option.value !== MarketSheetSegment.Leaderboard,
);

interface SheetHeaderProps {
  segment: MarketSheetSegment;
  showLeaderboard: boolean;
  onSegmentChange: (segment: MarketSheetSegment) => void;
  onClose: () => void;
}

const SheetHeader: FC<SheetHeaderProps> = ({ segment, showLeaderboard, onSegmentChange, onClose }) => (
  <div className="flex shrink-0 items-center gap-2">
    <SegmentedControl
      options={showLeaderboard ? SEGMENT_OPTIONS : SEGMENT_OPTIONS_WITHOUT_LEADERBOARD}
      value={segment}
      onChange={onSegmentChange}
      size="md"
    />
    <button
      type="button"
      onClick={onClose}
      aria-label="close"
      className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-4 text-neutral-11"
    >
      <XMarkIcon className="h-4 w-4" />
    </button>
  </div>
);

export default SheetHeader;
