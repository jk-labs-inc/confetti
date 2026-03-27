import ImageUpload from "@components/UI/ImageUpload";
import { FC, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { MAX_IMAGE_TITLE_LENGTH } from "../../constants";

interface DialogModalSendProposalImageAndTitleLayoutProps {
  onChange?: (value: string) => void;
}

const DialogModalSendProposalEntryPreviewImageAndTitleLayout: FC<DialogModalSendProposalImageAndTitleLayoutProps> = ({
  onChange,
}) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
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
        <p className="text-[16px] font-bold text-neutral-11">title</p>
        <div className={`bg-true-black rounded-[16px] border-true-black ${isMobile ? "" : "shadow-file-upload p-2"} `}>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            className="text-[16px] bg-secondary-1 outline-none rounded-[16px] placeholder-neutral-10 w-full h-12 indent-4 focus:outline-none"
            placeholder="this is my entry..."
            maxLength={MAX_IMAGE_TITLE_LENGTH}
          />
        </div>
        {isExceeded && <p className="text-negative-11 text-[12px] font-bold">maximum character limit reached!</p>}
      </div>
      <div className="flex flex-col gap-4">
        <p className="text-neutral-11 text-[16px] font-bold">image upload</p>
        <ImageUpload onImageLoad={onImageLoadHandler} initialImageUrl={imageUrl} />
      </div>
    </div>
  );
};

export default DialogModalSendProposalEntryPreviewImageAndTitleLayout;
