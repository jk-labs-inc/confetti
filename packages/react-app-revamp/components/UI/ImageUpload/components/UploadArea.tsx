import React, { FC } from "react";

interface UploadAreaProps {
  isLoading: boolean;
  validationError?: string;
  onClick: () => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (event: React.DragEvent<HTMLDivElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const UploadArea: FC<UploadAreaProps> = ({
  isLoading,
  validationError,
  onClick,
  onDragOver,
  onDrop,
  onDragLeave,
  fileInputRef,
  onFileInput,
}) => (
  <div className="flex flex-col gap-2">
    <div
      onClick={onClick}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragLeave={onDragLeave}
      className={`relative flex shadow-file-upload flex-col w-full md:w-[376px] min-h-28 py-3 justify-center items-center border ${
        validationError ? "border-negative-11" : "border-transparent hover:border-positive-11"
      } rounded-2xl cursor-pointer transition-all duration-300 ease-in-out`}
    >
      <input ref={fileInputRef} type="file" style={{ display: "none" }} onChange={onFileInput} accept="image/*" />
      <div className="flex flex-col items-center gap-1">
        {isLoading ? (
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-t-2 border-positive-11 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <img src="/create-flow/csv_upload.png" width="58" height="34" alt="upload" />
            <div className="flex flex-col">
              <p className="text-neutral-11 text-[16px] font-bold">drag & drop image</p>
              <span className="text-neutral-11 text-[16px] font-normal text-center">
                or <span className="text-[16px] text-positive-11">browse</span>
              </span>
            </div>
            <p className="text-xs text-neutral-9 text-center">supports any size</p>
          </div>
        )}
      </div>
    </div>
    {validationError && <p className="text-negative-11 text-[16px] font-bold mt-1 normal-case">{validationError}</p>}
  </div>
);

export default UploadArea;
