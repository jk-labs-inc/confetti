import { useDeployContestStore } from "@hooks/useDeployContest/store";
import CreateContestEntriesPreviewPickerOptionsContainer from "./components/Container";
import { useShallow } from "zustand/shallow";
import { EntryPreview } from "@hooks/useDeployContest/slices/contestMetadataSlice";

const CreateContestEntriesPreviewPickerOptions = () => {
  const { entryPreviewConfig, setEntryPreviewConfig } = useDeployContestStore(
    useShallow(state => ({
      entryPreviewConfig: state.entryPreviewConfig,
      setEntryPreviewConfig: state.setEntryPreviewConfig,
    })),
  );

  const handleImageOptionClick = () => {
    setEntryPreviewConfig({ ...entryPreviewConfig, preview: EntryPreview.IMAGE });
  };

  const handleTweetsOptionClick = () => {
    setEntryPreviewConfig({ ...entryPreviewConfig, preview: EntryPreview.TWEET });
  };

  const handleTitlesOptionClick = () => {
    setEntryPreviewConfig({ ...entryPreviewConfig, preview: EntryPreview.TITLE });
  };

  return (
    <div className="grid grid-cols-2 w-fit gap-4 md:gap-14">
      <CreateContestEntriesPreviewPickerOptionsContainer
        title="images"
        isActive={entryPreviewConfig.preview === EntryPreview.IMAGE}
        imageSrc="/create-flow/image-preview.png"
        onClick={handleImageOptionClick}
      />
      <CreateContestEntriesPreviewPickerOptionsContainer
        title="tweets"
        isActive={entryPreviewConfig.preview === EntryPreview.TWEET}
        imageSrc="/create-flow/tweet-preview.png"
        onClick={handleTweetsOptionClick}
      />
      <CreateContestEntriesPreviewPickerOptionsContainer
        title="titles"
        isActive={entryPreviewConfig.preview === EntryPreview.TITLE}
        imageSrc="/create-flow/title-preview.png"
        onClick={handleTitlesOptionClick}
      />
    </div>
  );
};

export default CreateContestEntriesPreviewPickerOptions;
