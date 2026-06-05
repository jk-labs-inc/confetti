import ContestImage from "@components/_pages/Contest/components/ContestImage";
import { FC } from "react";

interface EntryPreviewHeaderProps {
  image?: string;
  title?: string;
  contestName?: string;
}

const EntryPreviewHeader: FC<EntryPreviewHeaderProps> = ({ image, title, contestName }) => {
  if (!image && !title && !contestName) return null;

  return (
    <div className="flex items-center gap-3">
      {image && <ContestImage imageUrl={image} size="small" />}
      {(contestName || title) && (
        <div className="min-w-0 flex flex-col">
          {contestName && <p className="truncate text-[14px] text-neutral-9">{contestName}</p>}
          {title && <p className="truncate text-[16px] text-neutral-11 font-bold">{title}</p>}
        </div>
      )}
    </div>
  );
};

export default EntryPreviewHeader;
