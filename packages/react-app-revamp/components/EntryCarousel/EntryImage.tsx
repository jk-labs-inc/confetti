import { FC, useState } from "react";
import { COVER_MIN_VISIBLE } from "./constants";

interface EntryImageProps {
  src: string;
  boxAspect: number;
  fit: "adaptive" | "contain";
}

const EntryImage: FC<EntryImageProps> = ({ src, boxAspect, fit }) => {
  const [imageRatio, setImageRatio] = useState<number | null>(null);

  const measure = (img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth && img.naturalHeight) setImageRatio(img.naturalWidth / img.naturalHeight);
  };

  const boxRatio = 1 / boxAspect; // both ratios as width / height
  const coverVisible = imageRatio ? Math.min(boxRatio / imageRatio, imageRatio / boxRatio) : 1;

  if (fit === "contain") {
    return (
      <>
        <img
          src={src}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full scale-125 object-cover blur-2xl saturate-150 brightness-75"
        />
        <img src={src} alt="entry image" className="absolute inset-0 h-full w-full object-contain" />
      </>
    );
  }

  if (coverVisible >= COVER_MIN_VISIBLE) {
    return (
      <img
        ref={measure}
        onLoad={e => measure(e.currentTarget)}
        src={src}
        alt="entry image"
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }

  return (
    <>
      <img
        src={src}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full scale-125 object-cover blur-2xl saturate-150 brightness-75"
      />
      <img
        src={src}
        alt="entry image"
        className="absolute max-w-none object-contain"
        style={{
          width: `${100 / COVER_MIN_VISIBLE}%`,
          height: `${100 / COVER_MIN_VISIBLE}%`,
          left: `${(100 - 100 / COVER_MIN_VISIBLE) / 2}%`,
          top: `${(100 - 100 / COVER_MIN_VISIBLE) / 2}%`,
        }}
      />
    </>
  );
};

export default EntryImage;
