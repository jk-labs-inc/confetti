import { XMarkIcon } from "@heroicons/react/24/outline";
import React, { FC, useRef, useState } from "react";

interface SelectedImagePreviewProps {
  imageUrl: string;
  fileName: string;
  onRemove: (e: React.MouseEvent) => void;
}

const SelectedImagePreview: FC<SelectedImagePreviewProps> = ({ imageUrl, fileName, onRemove }) => {
  const [showPreview, setShowPreview] = useState(false);
  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTap = () => {
    if (showPreview) {
      setShowPreview(false);
      return;
    }

    setShowPreview(true);

    if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
    previewTimeoutRef.current = setTimeout(() => setShowPreview(false), 3000);
  };

  return (
    <div className="relative" style={{ overflow: "visible" }}>
      <div
        className="relative flex shadow-file-upload m-auto md:m-0 flex-row w-full md:w-[376px] items-center border border-transparent hover:border-positive-11 gap-3 py-3 px-4 rounded-2xl cursor-default transition-all duration-300 ease-in-out"
        onMouseEnter={() => setShowPreview(true)}
        onMouseLeave={() => setShowPreview(false)}
        onClick={handleTap}
      >
        <img
          src={imageUrl}
          alt={fileName}
          className="w-10 h-10 rounded object-cover shrink-0"
        />
        <p className="text-neutral-11 text-[14px] truncate flex-1">{fileName}</p>
        <button
          onClick={onRemove}
          className="bg-true-black rounded-full p-1 shadow-md hover:bg-neutral-3 transition-colors duration-200 shrink-0"
        >
          <XMarkIcon className="w-5 h-5 text-neutral-11" />
        </button>
      </div>

      {showPreview && (
        <div className="absolute left-0 top-full mt-2 z-50 rounded-lg overflow-hidden shadow-lg border border-neutral-3">
          <img src={imageUrl} alt={fileName} className="max-w-[200px] max-h-[200px] object-contain bg-true-black" />
        </div>
      )}
    </div>
  );
};

export default SelectedImagePreview;
