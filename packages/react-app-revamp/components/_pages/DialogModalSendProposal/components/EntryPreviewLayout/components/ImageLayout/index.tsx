import ImageUpload from "@components/UI/ImageUpload";
import CreateGradientTitle from "@components/_pages/Create/components/GradientTitle";
import { EntryPreview } from "@hooks/useDeployContest/slices/contestMetadataSlice";
import { FC, useState } from "react";
import EntryImagePreview from "../EntryImagePreview";
import { viewerDevice } from "../EntryImagePreview/sizing";

interface DialogModalSendProposalImageLayoutProps {
  onChange?: (imageUrl: string) => void;
}

const DialogModalSendProposalEntryPreviewImageLayout: FC<DialogModalSendProposalImageLayoutProps> = ({ onChange }) => {
  const [previewDevice, setPreviewDevice] = useState(viewerDevice);

  const onImageLoadHandler = (imageUrl: string) => {
    onChange?.(imageUrl);
  };

  return (
    <div className="flex flex-col gap-4">
      <CreateGradientTitle textSize="small">image upload</CreateGradientTitle>
      <ImageUpload
        onImageLoad={onImageLoadHandler}
        renderPreview={imageUrl => (
          <EntryImagePreview
            enabledPreview={EntryPreview.IMAGE}
            metadataValue={imageUrl}
            device={previewDevice}
            onDeviceChange={setPreviewDevice}
          />
        )}
      />
    </div>
  );
};

export default DialogModalSendProposalEntryPreviewImageLayout;
