import { verifyEntryPreviewPrompt } from "@components/_pages/DialogModalSendProposal/utils";
import { EntryPreview } from "@hooks/useDeployContest/slices/contestMetadataSlice";
import { useMetadataStore } from "@hooks/useMetadataFields/store";
import { FC } from "react";
import ImageLayout from "./components/ImageLayout";
import TitleLayout from "./components/TitleLayout";
import TweetLayout from "./components/TweetLayout";
import ImageAndTitleLayout from "./components/ImageAndTitleLayout";
import TweetAndTitleLayout from "./components/TweetAndTitleLayout";

interface DialogModalSendProposalEntryPreviewLayoutsProps {
  entryPreviewLayout: string;
}

const DialogModalSendProposalEntryPreviewLayout: FC<DialogModalSendProposalEntryPreviewLayoutsProps> = ({
  entryPreviewLayout,
}) => {
  const { enabledPreview } = verifyEntryPreviewPrompt(entryPreviewLayout);
  const { setInputValue } = useMetadataStore();

  const handleMetadataFieldChange = (value: string) => {
    setInputValue(0, value);
  };

  const renderLayout = () => {
    switch (enabledPreview) {
      case EntryPreview.TITLE:
        return <TitleLayout onChange={handleMetadataFieldChange} />;
      case EntryPreview.IMAGE:
        return <ImageLayout onChange={handleMetadataFieldChange} />;
      case EntryPreview.IMAGE_AND_TITLE:
        return <ImageAndTitleLayout onChange={handleMetadataFieldChange} />;
      case EntryPreview.TWEET:
        return <TweetLayout onChange={handleMetadataFieldChange} />;
      case EntryPreview.TWEET_AND_TITLE:
        return <TweetAndTitleLayout onChange={handleMetadataFieldChange} />;
      default:
        return null;
    }
  };

  return <div className="flex flex-col gap-8">{renderLayout()}</div>;
};

export default DialogModalSendProposalEntryPreviewLayout;
