import React from "react";

interface ImageWithFallbackProps {
  fullSrc: string;
  alt: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ fullSrc, alt }) => {
  const hasValidSrc = fullSrc && fullSrc.trim() !== "";

  // Don't render anything if no valid source is available
  if (!hasValidSrc) {
    return null;
  }

  return (
    <div className="relative rounded-[16px] w-full h-full">
      <img src={fullSrc} alt={alt} className="rounded-[16px] w-full h-full min-h-52 object-contain" />
      <div
        className="absolute inset-x-0 top-0 h-20 rounded-t-[16px]"
        style={{
          background: "linear-gradient(180deg, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.70) 50%, rgba(0, 0, 0, 0) 100%)",
        }}
      />
    </div>
  );
};

export default ImageWithFallback;
