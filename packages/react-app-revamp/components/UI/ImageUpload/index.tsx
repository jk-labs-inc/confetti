import { useUploadImageStore } from "@hooks/useUploadImage";
import React, { FC, useEffect, useRef, useState } from "react";
import NetworkErrorRetry from "./components/NetworkErrorRetry";
import SelectedImagePreview from "./components/SelectedImagePreview";
import UploadArea from "./components/UploadArea";
import UrlInputField from "./components/UrlInputField";
import { ACCEPTED_FILE_TYPES } from "./utils";

interface ImageUploadProps {
  initialImageUrl?: string;
  initialFileName?: string;
  onImageLoad?: (imageUrl: string, fileName?: string) => void;
}

const ImageUpload: FC<ImageUploadProps> = ({ initialImageUrl, initialFileName, onImageLoad }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(initialImageUrl || null);
  const [fileName, setFileName] = useState<string | null>(initialFileName || null);
  const [inputMethod, setInputMethod] = useState<"upload" | "url">("upload");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isNetworkError, setIsNetworkError] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<{
    upload?: string;
    url?: string;
  }>({});
  const { uploadImage } = useUploadImageStore();

  useEffect(() => {
    if (validationError?.upload) {
      setSelectedImage(null);
    }
    setSelectedImage(initialImageUrl || null);
  }, [initialImageUrl, validationError?.upload]);

  useEffect(() => {
    if (isNetworkError) {
      setSelectedImage(null);
    }
  }, [isNetworkError]);

  const validateFile = (file: File): boolean => {
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      setValidationError({
        ...validationError,
        upload: "please upload a valid image/gif file (JPEG, JPG, PNG, JFIF, GIF, or WebP)",
      });
      return false;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setValidationError({
        ...validationError,
        upload: "file size should be less than 5MB",
      });
      return false;
    }

    setValidationError({
      ...validationError,
      upload: undefined,
    });
    return true;
  };

  const uploadImageToServer = async (file: File): Promise<string> => {
    const img = await uploadImage(file);
    return img ?? "";
  };

  const handleFileInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      if (validateFile(file)) {
        await processFileUpload(file);
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const processFileUpload = async (file: File) => {
    setIsNetworkError(false);
    setValidationError({});
    setIsLoading(true);

    try {
      const imageUrl = await uploadImageToServer(file);

      if (!imageUrl) {
        setIsNetworkError(true);
        setSelectedImage(null);
        onImageLoad?.("");
        return;
      }

      setSelectedImage(imageUrl);
      setFileName(file.name);
      onImageLoad?.(imageUrl, file.name);
    } catch (error) {
      setIsNetworkError(true);
      setSelectedImage(null);
      onImageLoad?.("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];

      if (validateFile(file)) {
        await processFileUpload(file);
      }
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImage(null);
    setFileName(null);
    onImageLoad?.("");
  };

  const handleUrlChange = (value: string) => {
    setImageUrl(value);

    if (validationError?.url) {
      setValidationError({
        ...validationError,
        url: undefined,
      });
    }

    if (!value) {
      setSelectedImage(null);
      setFileName(null);
      onImageLoad?.("");
      return;
    }

    if (validateUrl(value)) {
      const urlFileName = value.split("/").pop()?.split("?")[0] || "image";
      setSelectedImage(value);
      setFileName(urlFileName);
      onImageLoad?.(value, urlFileName);
      setIsNetworkError(false);
    }
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);

      const fileExtension = url.split(".").pop()?.toLowerCase();
      const validImageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "jfif"];

      if (!fileExtension || !validImageExtensions.includes(fileExtension)) {
        setValidationError({
          ...validationError,
          url: "url must point to a valid image file (JPEG, JPG, PNG, JFIF, GIF, or WebP)",
        });
        return false;
      }

      return true;
    } catch (e) {
      setValidationError({
        ...validationError,
        url: "please enter a valid URL",
      });
      return false;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {selectedImage && !isLoading ? (
        <SelectedImagePreview imageUrl={selectedImage} fileName={fileName || "image"} onRemove={handleRemoveImage} />
      ) : isNetworkError ? (
        <NetworkErrorRetry
          inputMethod={inputMethod}
          onInputMethodChange={setInputMethod}
          uploadAreaComponent={
            <UploadArea
              isLoading={isLoading}
              validationError={validationError?.upload}
              onClick={handleClick}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragLeave={handleDragLeave}
              fileInputRef={fileInputRef}
              onFileInput={handleFileInput}
            />
          }
          urlInputComponent={
            <UrlInputField value={imageUrl} onChange={handleUrlChange} validationError={validationError?.url} />
          }
        />
      ) : (
        <UploadArea
          isLoading={isLoading}
          validationError={validationError?.upload}
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragLeave={handleDragLeave}
          fileInputRef={fileInputRef}
          onFileInput={handleFileInput}
        />
      )}
    </div>
  );
};

export default ImageUpload;
