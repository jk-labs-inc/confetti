import CreateContestPromptEditors from "./components/PromptEditors";
import CreateUploadImage from "../../components/UploadImage";

const CreateContestDescriptionSection = () => {
  return (
    <div className="flex flex-col gap-8">
      <CreateUploadImage />
      <CreateContestPromptEditors />
    </div>
  );
};

export default CreateContestDescriptionSection;
