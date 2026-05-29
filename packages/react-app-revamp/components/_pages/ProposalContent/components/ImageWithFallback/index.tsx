"use client";

import { ENTRY_IMAGE_PRESET } from "lib/image/cloudflare";
import { useCloudflareFluidImage } from "lib/image/useCloudflareImage";
import React from "react";

interface ImageWithFallbackProps {
  fullSrc: string;
  alt: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ fullSrc, alt }) => {
  const hasValidSrc = fullSrc && fullSrc.trim() !== "";

  // High-quality, resized, responsive variants of the entry image. Non-transformable
  // sources (external/IPFS) fall back to the original URL untouched.
  const { src, srcSet, sizes } = useCloudflareFluidImage(fullSrc, ENTRY_IMAGE_PRESET.widths, ENTRY_IMAGE_PRESET.sizes, {
    quality: ENTRY_IMAGE_PRESET.quality,
    fit: ENTRY_IMAGE_PRESET.fit,
  });

  // Don't render anything if no valid source is available
  if (!hasValidSrc) {
    return null;
  }

  return (
    <div className="relative rounded-[16px] w-full h-full">
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="rounded-[16px] w-full h-full min-h-52 object-contain"
      />
    </div>
  );
};

export default ImageWithFallback;
