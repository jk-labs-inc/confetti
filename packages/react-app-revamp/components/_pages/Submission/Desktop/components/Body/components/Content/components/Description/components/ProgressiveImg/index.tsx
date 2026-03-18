import { FC, useState, useEffect, useRef, useCallback } from "react";
import ImageModal from "../ImageModal";

interface ProgressiveImgProps {
  src: string;
  alt: string;
}

const getRenderedImageWidth = (imgEl: HTMLImageElement): number => {
  const { naturalWidth, naturalHeight, clientWidth, clientHeight } = imgEl;
  if (!naturalWidth || !naturalHeight) return clientWidth;
  const elementAspect = clientWidth / clientHeight;
  const imageAspect = naturalWidth / naturalHeight;
  if (imageAspect > elementAspect) return clientWidth;
  return clientHeight * imageAspect;
};

const ProgressiveImg: FC<ProgressiveImgProps> = ({ src, alt }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setIsLoaded(true);
    };
  }, [src]);

  const isOverImage = useCallback((e: React.MouseEvent<HTMLImageElement>) => {
    const img = imgRef.current;
    if (!img) return false;
    const rect = img.getBoundingClientRect();
    const renderedWidth = getRenderedImageWidth(img);
    return e.clientX <= rect.left + renderedWidth;
  }, []);

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isOverImage(e)) return;
    e.currentTarget.blur();
    setIsModalOpen(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    const img = imgRef.current;
    if (!img) return;
    img.style.cursor = isOverImage(e) ? "zoom-in" : "default";
  };

  const handleImageKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`w-full h-auto max-h-[418px] object-contain object-left rounded-lg my-4 hover:opacity-90 transition-opacity`}
        style={{
          filter: isLoaded ? "blur(0px)" : "blur(10px)",
          transition: isLoaded ? "filter 0.5s linear" : "none",
        }}
        loading="lazy"
        onClick={handleImageClick}
        onMouseMove={handleMouseMove}
        onKeyDown={handleImageKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`Click to view full size: ${alt}`}
      />

      <ImageModal src={src} alt={alt} isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
};

export default ProgressiveImg;
