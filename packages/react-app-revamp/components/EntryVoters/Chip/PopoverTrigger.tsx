import FloatingSurface from "@components/UI/Tooltip/FloatingSurface";
import { useTooltip } from "@components/UI/Tooltip/useTooltip";
import { EntryVotersResult } from "@hooks/useEntryVoters";
import { FC } from "react";
import { CHIP_CLASS_NAME } from "../constants";
import { formatVotersAriaLabel } from "../formatVotersLabel";
import EntryVotersPopover from "../Popover";
import EntryVotersChipFace from "./ChipFace";

interface EntryVotersPopoverTriggerProps {
  proposalId: string;
  voters: Pick<EntryVotersResult, "topVoters" | "voterCount">;
  className?: string;
}

const POPOVER_OFFSET_PX = 12;
const POPOVER_CORNER_RADIUS_PX = 20;
const POPOVER_ALIGNMENT_OFFSET_PX = -14;

const EntryVotersPopoverTrigger: FC<EntryVotersPopoverTriggerProps> = ({ proposalId, voters, className = "" }) => {
  const tooltip = useTooltip({
    interactive: true,
    enableClick: true,
    enableHover: false,
    placement: "right-start",
    offsetPx: POPOVER_OFFSET_PX,
    alignmentOffsetPx: POPOVER_ALIGNMENT_OFFSET_PX,
    arrowPadding: POPOVER_CORNER_RADIUS_PX,
  });

  return (
    <>
      <button
        ref={tooltip.refs.setReference}
        {...tooltip.getReferenceProps({
          onPointerDown: event => event.stopPropagation(),
          onClick: event => event.stopPropagation(),
        })}
        type="button"
        aria-label={formatVotersAriaLabel(voters.voterCount)}
        className={`${CHIP_CLASS_NAME} cursor-pointer focus:outline-none ${className}`}
      >
        <EntryVotersChipFace topVoters={voters.topVoters} voterCount={voters.voterCount} />
      </button>
      <FloatingSurface tooltip={tooltip} surface="voters">
        <EntryVotersPopover proposalId={proposalId} />
      </FloatingSurface>
    </>
  );
};

export default EntryVotersPopoverTrigger;
