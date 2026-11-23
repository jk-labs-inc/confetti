import { XMarkIcon } from "@heroicons/react/24/outline";
import React, { FC, ReactNode, useEffect, useRef, useState } from "react";

const MOUSE_POINTER_TYPE = "mouse";

interface SelectedImagePreviewProps {
  imageUrl: string;
  fileName: string;
  onRemove: (e: React.MouseEvent) => void;
  renderPreview?: (imageUrl: string) => ReactNode;
}

const SelectedImagePreview: FC<SelectedImagePreviewProps> = ({ imageUrl, fileName, onRemove, renderPreview }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const pressPointerTypeRef = useRef<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!showPreview) return;
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setShowPreview(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePress);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePress);
  }, [showPreview]);

  const handlePointerEnter = (event: React.PointerEvent) => {
    if (event.pointerType === MOUSE_POINTER_TYPE) setShowPreview(true);
  };

  const handlePointerLeave = (event: React.PointerEvent) => {
    if (event.pointerType === MOUSE_POINTER_TYPE) setShowPreview(false);
  };

  const handleChipPointerDown = (event: React.PointerEvent) => {
    pressPointerTypeRef.current = event.pointerType;
  };

  const handleChipClick = () => {
    const pressPointerType = pressPointerTypeRef.current;
    pressPointerTypeRef.current = null;
    if (pressPointerType !== MOUSE_POINTER_TYPE) setShowPreview(isShown => !isShown);
  };

  return (
    <div
      ref={rootRef}
      className="relative w-full md:w-[376px]"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <div
        className="relative flex shadow-file-upload flex-row w-full items-center border border-transparent hover:border-positive-11 gap-3 py-3 px-4 rounded-2xl cursor-default transition-all duration-300 ease-in-out"
        onPointerDown={handleChipPointerDown}
        onClick={handleChipClick}
      >
        <img src={imageUrl} alt={fileName} className="w-10 h-10 rounded object-cover shrink-0" />
        <p className="text-neutral-11 text-[14px] truncate flex-1">{fileName}</p>
        <button
          onClick={onRemove}
          className="bg-true-black rounded-full p-1 shadow-md hover:bg-neutral-3 transition-colors duration-200 shrink-0"
        >
          <XMarkIcon className="w-5 h-5 text-neutral-11" />
        </button>
      </div>

      {showPreview && (
        <div className="absolute left-0 top-full z-50 max-w-full pt-2">
          {renderPreview ? (
            renderPreview(imageUrl)
          ) : (
            <div className="rounded-lg overflow-hidden shadow-lg border border-neutral-3">
              <img src={imageUrl} alt={fileName} className="max-w-[200px] max-h-[200px] object-contain bg-true-black" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SelectedImagePreview;
