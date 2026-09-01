import { EntryPreviewHeaderProps } from "@components/Voting/components/EntryPreviewHeader";
import { usePickedEntryPreview } from "@components/Voting/hooks/usePickedEntryPreview";
import ContestImage from "@components/_pages/Contest/components/ContestImage";
import { FC } from "react";

interface FocusModeEntryPreviewProps {
  entryPreview?: EntryPreviewHeaderProps;
}

const FocusModeEntryPreview: FC<FocusModeEntryPreviewProps> = ({ entryPreview }) => {
  const pickedEntryPreview = usePickedEntryPreview();
  const { image, title } = entryPreview ?? pickedEntryPreview;

  if (!image && !title) return null;

  return (
    <div className="mx-4 mb-4 mt-2 flex items-center gap-3">
      {image && <ContestImage imageUrl={image} size="small" />}
      <div className="flex min-w-0 flex-col">
        <p className="text-[12px] text-neutral-9">add votes on</p>
        {title && <p className="truncate text-[16px] font-bold text-neutral-11">{title}</p>}
      </div>
    </div>
  );
};

export default FocusModeEntryPreview;
