import AnyoneCanSubmitSetting from "./components/AnyoneCanSubmitSetting";
import CreateContestEntriesPreviewPicker from "./components/PreviewPicker";
import CreateContestCreatorSplitToggle from "./components/CreatorSplitToggle";

const CreateContestParametersSection = () => {
  return (
    <div className="flex flex-col gap-8">
      <CreateContestEntriesPreviewPicker />
      <AnyoneCanSubmitSetting />
      <CreateContestCreatorSplitToggle />
    </div>
  );
};

export default CreateContestParametersSection;
