import { useContestStatusStore } from "@hooks/useContestStatus/store";
import { EntryPreview } from "@hooks/useDeployContest/slices/contestMetadataSlice";
import { useProposalStore } from "@hooks/useProposal/store";
import { FC, useMemo } from "react";
import DesktopTile from "./DesktopTile";
import DeviceTabs from "./DeviceTabs";
import MobileCard from "./MobileCard";
import { buildPreviewProposal } from "./previewProposal";
import { PreviewDevice } from "./types";

const PANEL_HALO = "0 0 28px -8px rgba(255,255,255,0.22)";

interface EntryImagePreviewProps {
  enabledPreview: EntryPreview;
  metadataValue: string;
  device: PreviewDevice;
  onDeviceChange: (device: PreviewDevice) => void;
}

const EntryImagePreview: FC<EntryImagePreviewProps> = ({ enabledPreview, metadataValue, device, onDeviceChange }) => {
  const contestStatus = useContestStatusStore(state => state.contestStatus);
  const entries = useProposalStore(state => state.listProposalsData);
  const proposal = useMemo(() => buildPreviewProposal(metadataValue), [metadataValue]);

  return (
    <div
      className="flex w-[300px] max-w-full flex-col gap-3 rounded-2xl border border-white/10 bg-neutral-2 p-3"
      style={{ boxShadow: PANEL_HALO }}
    >
      <DeviceTabs value={device} onChange={onDeviceChange} />
      <div className="flex justify-center rounded-xl bg-true-black p-6">
        {device === "desktop" ? (
          <DesktopTile
            proposal={proposal}
            enabledPreview={enabledPreview}
            contestStatus={contestStatus}
            entries={entries}
          />
        ) : (
          <MobileCard
            proposal={proposal}
            enabledPreview={enabledPreview}
            contestStatus={contestStatus}
            hasOtherEntries={entries.length > 0}
          />
        )}
      </div>
    </div>
  );
};

export default EntryImagePreview;
