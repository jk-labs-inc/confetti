import { useDeployContestStore } from "@hooks/useDeployContest/store";
import CreateContestEntriesPreviewPickerOptionsContainer from "./components/Container";
import { useShallow } from "zustand/shallow";
import { EntryPreview } from "@hooks/useDeployContest/slices/contestMetadataSlice";
import TitlePreview from "./components/previews/TitlePreview";
import ImagePreview from "./components/previews/ImagePreview";

const PREVIEW_OPTIONS = [
  { preview: EntryPreview.TITLE, title: "titles", Component: TitlePreview },
  { preview: EntryPreview.IMAGE, title: "images", Component: ImagePreview },
] as const;

const CreateContestEntriesPreviewPickerOptions = () => {
  const { entryPreviewConfig, setEntryPreviewConfig } = useDeployContestStore(
    useShallow(state => ({
      entryPreviewConfig: state.entryPreviewConfig,
      setEntryPreviewConfig: state.setEntryPreviewConfig,
    })),
  );

  const handleOptionClick = (preview: EntryPreview) => {
    setEntryPreviewConfig({ ...entryPreviewConfig, preview });
  };

  return (
    <div className="grid grid-cols-2 w-full gap-3 md:gap-6">
      {PREVIEW_OPTIONS.map(({ preview, title, Component }) => (
        <CreateContestEntriesPreviewPickerOptionsContainer
          key={preview}
          title={title}
          isActive={entryPreviewConfig.preview === preview}
          onClick={() => handleOptionClick(preview)}
        >
          <Component />
        </CreateContestEntriesPreviewPickerOptionsContainer>
      ))}
    </div>
  );
};

export default CreateContestEntriesPreviewPickerOptions;
