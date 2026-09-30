"use client";

import { ENTRY_IMAGE_PRESET } from "lib/image/cloudflare";
import { useCloudflareFluidImage } from "lib/image/useCloudflareImage";
import React, { SyntheticEvent, useState } from "react";

const CROP_FOCUS_POSITION = "50% 30%";

interface ImageWithFallbackProps {
  fullSrc: string;
  alt: string;
  cropHeightRatio?: number;
  onLoad?: (event: SyntheticEvent<HTMLImageElement>) => void;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ fullSrc, alt, cropHeightRatio, onLoad }) => {
  const hasValidSrc = fullSrc && fullSrc.trim() !== "";

  // High-quality, resized, responsive variants of the entry image. Non-transformable
  // sources (external/IPFS) fall back to the original URL untouched.
  const { src, srcSet, sizes } = useCloudflareFluidImage(fullSrc, ENTRY_IMAGE_PRESET.widths, ENTRY_IMAGE_PRESET.sizes, {
    quality: ENTRY_IMAGE_PRESET.quality,
    fit: ENTRY_IMAGE_PRESET.fit,
  });
  const [failed, setFailed] = useState(false);

  const handleError = () => {
    if (!failed && src !== fullSrc) setFailed(true);
  };

  // Don't render anything if no valid source is available
  if (!hasValidSrc) {
    return null;
  }

  const isCropped = cropHeightRatio !== undefined;

  return (
    <div
      className="relative rounded-[12px] wide:rounded-2xl w-full h-full"
      style={isCropped ? { aspectRatio: 1 / cropHeightRatio } : undefined}
    >
      <img
        src={failed ? fullSrc : src}
        srcSet={failed ? undefined : srcSet}
        sizes={sizes}
        onError={handleError}
        onLoad={onLoad}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`rounded-[12px] wide:rounded-2xl w-full h-full min-h-52 ${
          isCropped ? "absolute inset-0 object-cover" : "object-contain"
        }`}
        style={isCropped ? { objectPosition: CROP_FOCUS_POSITION } : undefined}
      />
      <div
        className="lg:hidden absolute inset-x-0 top-0 h-20 rounded-t-[12px]"
        style={{
          background: "linear-gradient(180deg, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.70) 50%, rgba(0, 0, 0, 0) 100%)",
        }}
      />
    </div>
  );
};

export default ImageWithFallback;
