import ImageUpload from "@components/UI/ImageUpload";
import CreateGradientTitle from "@components/_pages/Create/components/GradientTitle";
import { FC } from "react";

interface DialogModalSendProposalImageLayoutProps {
  onChange?: (imageUrl: string) => void;
}

const DialogModalSendProposalEntryPreviewImageLayout: FC<DialogModalSendProposalImageLayoutProps> = ({ onChange }) => {
  const onImageLoadHandler = (imageUrl: string) => {
    onChange?.(imageUrl);
  };

  return (
    <div className="flex flex-col gap-4">
      <CreateGradientTitle textSize="small">image upload</CreateGradientTitle>
      <ImageUpload onImageLoad={onImageLoadHandler} />
    </div>
  );
};

export default DialogModalSendProposalEntryPreviewImageLayout;
