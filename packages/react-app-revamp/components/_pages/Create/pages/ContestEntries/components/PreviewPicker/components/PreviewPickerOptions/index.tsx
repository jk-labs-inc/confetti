import { useDeployContestStore } from "@hooks/useDeployContest/store";
import CreateContestEntriesPreviewPickerOptionsContainer from "./components/Container";
import { useShallow } from "zustand/shallow";
import { EntryPreview } from "@hooks/useDeployContest/slices/contestMetadataSlice";
import TitlePreview from "./components/previews/TitlePreview";
import ImagePreview from "./components/previews/ImagePreview";
import TweetPreview from "./components/previews/TweetPreview";

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
    <div className="grid grid-cols-2 w-fit gap-4 md:gap-6">
      <CreateContestEntriesPreviewPickerOptionsContainer
        title="titles"
        isActive={entryPreviewConfig.preview === EntryPreview.TITLE}
        onClick={handleTitlesOptionClick}
      >
        <TitlePreview />
      </CreateContestEntriesPreviewPickerOptionsContainer>
      <CreateContestEntriesPreviewPickerOptionsContainer
        title="images"
        isActive={entryPreviewConfig.preview === EntryPreview.IMAGE}
        onClick={handleImageOptionClick}
      >
        <ImagePreview />
      </CreateContestEntriesPreviewPickerOptionsContainer>
      <CreateContestEntriesPreviewPickerOptionsContainer
        title="tweets"
        isActive={entryPreviewConfig.preview === EntryPreview.TWEET}
        onClick={handleTweetsOptionClick}
      >
        <TweetPreview />
      </CreateContestEntriesPreviewPickerOptionsContainer>
    </div>
  );
};

export default CreateContestEntriesPreviewPickerOptions;
