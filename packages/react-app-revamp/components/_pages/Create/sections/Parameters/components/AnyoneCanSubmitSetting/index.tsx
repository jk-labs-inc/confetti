import CreateSwitch from "@components/_pages/Create/components/Switch";
import { EntryPermission } from "@hooks/useDeployContest/slices/contestMetadataSlice";
import { useDeployContestStore } from "@hooks/useDeployContest/store";
import { useShallow } from "zustand/shallow";

const AnyoneCanSubmitSetting = () => {
  const { entryPreviewConfig, setEntryPreviewConfig } = useDeployContestStore(
    useShallow(state => ({
      entryPreviewConfig: state.entryPreviewConfig,
      setEntryPreviewConfig: state.setEntryPreviewConfig,
    })),
  );

  const handleAnyoneCanSubmitChange = (checked: boolean) => {
    setEntryPreviewConfig({
      ...entryPreviewConfig,
      isAnyoneCanSubmit: checked ? EntryPermission.ANYONE_CAN_SUBMIT : EntryPermission.ONLY_CREATOR,
    });
  };

  return (
    <div className="flex items-center gap-6">
      <CreateSwitch
        checked={entryPreviewConfig.isAnyoneCanSubmit === EntryPermission.ANYONE_CAN_SUBMIT}
        onChange={handleAnyoneCanSubmitChange}
      />
      <p className="text-base text-neutral-11">let anyone submit entries (not just me)</p>
    </div>
  );
};

export default AnyoneCanSubmitSetting;
