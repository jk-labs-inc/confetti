import { useMediaQuery } from "react-responsive";
import CreateContestEntriesPreviewPickerOptions from "./components/PreviewPickerOptions";

const CreateContestEntriesPreviewPicker = () => {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const title = isMobile ? "how should entries be previewed?" : "how should entries be previewed on the contest page?";
  return (
    <div className="flex flex-col gap-8">
      <p className="text-[20px] text-neutral-11 font-bold">{title}</p>
      <CreateContestEntriesPreviewPickerOptions />
    </div>
  );
};

export default CreateContestEntriesPreviewPicker;
