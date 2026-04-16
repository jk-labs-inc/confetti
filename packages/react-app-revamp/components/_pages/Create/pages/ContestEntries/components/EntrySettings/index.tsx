import AnyoneCanSubmitSetting from "./components/AnyoneCanSubmitSetting";
import RequireAdditionalFieldsSetting from "./components/RequireAdditionalFieldsSetting";

const CreateContestEntriesEntrySettings = () => {
  return (
    <div className="flex flex-col gap-8 pl-6">
      <AnyoneCanSubmitSetting />
      <RequireAdditionalFieldsSetting />
    </div>
  );
};

export default CreateContestEntriesEntrySettings;
