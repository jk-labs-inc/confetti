import ImageUpload from "@components/UI/ImageUpload";
import CreateGradientTitle from "@components/_pages/Create/components/GradientTitle";
import { FC, useState } from "react";
import { MAX_IMAGE_TITLE_LENGTH } from "../../constants";

interface DialogModalSendProposalImageAndTitleLayoutProps {
  onChange?: (value: string) => void;
}

const DialogModalSendProposalEntryPreviewImageAndTitleLayout: FC<DialogModalSendProposalImageAndTitleLayoutProps> = ({
  onChange,
}) => {
  const [isExceeded, setIsExceeded] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [imageUrl, setImageUrl] = useState<string>("");

  const updateCombinedValue = (newImageUrl: string = imageUrl, newInputValue: string = inputValue) => {
    // if both values are empty, return empty string
    if (!newImageUrl || !newInputValue) {
      onChange?.("");
      return;
    }

    // sanitize values - empty strings if undefined/null
    const sanitizedImageUrl = newImageUrl?.trim() || "";
    const sanitizedTitle = newInputValue?.trim() || "";

    const combinedValue = `JOKERACE_IMG=${encodeURIComponent(sanitizedImageUrl)}&JOKERACE_IMG_TITLE=${encodeURIComponent(sanitizedTitle)}`;
    onChange?.(combinedValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setIsExceeded(value.length >= MAX_IMAGE_TITLE_LENGTH);
    updateCombinedValue(imageUrl, value);
  };

  const onImageLoadHandler = (imageUrl: string) => {
    setImageUrl(imageUrl);
    updateCombinedValue(imageUrl, inputValue);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <CreateGradientTitle textSize="small">title</CreateGradientTitle>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          className="w-full text-[16px] bg-secondary-1 outline-none rounded-[10px] border border-neutral-17 placeholder-neutral-10 h-12 indent-4 focus:outline-none"
          placeholder="this is my entry..."
          maxLength={MAX_IMAGE_TITLE_LENGTH}
        />
        {isExceeded && <p className="text-negative-11 text-[12px] font-bold">maximum character limit reached!</p>}
      </div>
      <div className="flex flex-col gap-4">
        <CreateGradientTitle textSize="small">image upload</CreateGradientTitle>
        <ImageUpload onImageLoad={onImageLoadHandler} initialImageUrl={imageUrl} />
      </div>
    </div>
  );
};

export default DialogModalSendProposalEntryPreviewImageAndTitleLayout;
