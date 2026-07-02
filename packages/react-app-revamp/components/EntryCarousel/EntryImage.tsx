import { CSSProperties, FC, useState } from "react";
import { COVER_MIN_VISIBLE } from "./constants";

interface EntryImageProps {
  src: string;
  boxAspect: number;
  fit: "adaptive" | "contain";
}

// https://ishadeed.com/article/css-masking/ - feathers the drawn image's edges into the backdrop
const edgeFadeMask = (imageRatio: number, boxRatio: number): string | undefined => {
  const wide = imageRatio >= boxRatio;
  const visible = (wide ? boxRatio / imageRatio : imageRatio / boxRatio) * 100;

  if (visible > 98) return undefined;
  const feather = Math.min(4, visible / 4);
  const start = (100 - visible) / 2;
  const end = start + visible;
  return `linear-gradient(${wide ? "to bottom" : "to right"}, transparent ${start}%, black ${start + feather}%, black ${
    end - feather
  }%, transparent ${end}%)`;
};

const EntryImage: FC<EntryImageProps> = ({ src, boxAspect, fit }) => {
  const [imageRatio, setImageRatio] = useState<number | null>(null);

  const measure = (img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth && img.naturalHeight) setImageRatio(img.naturalWidth / img.naturalHeight);
  };

  const boxRatio = 1 / boxAspect; // both ratios as width / height
  const coverVisible = imageRatio ? Math.min(boxRatio / imageRatio, imageRatio / boxRatio) : 1;

  const edgeFade = imageRatio ? edgeFadeMask(imageRatio, boxRatio) : undefined;
  const maskStyle: CSSProperties | undefined = edgeFade
    ? { maskImage: edgeFade, WebkitMaskImage: edgeFade }
    : undefined;

  if (fit === "contain") {
    return (
      <>
        <img
          src={src}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full scale-125 object-cover blur-2xl saturate-150 brightness-75"
        />
        <img
          ref={measure}
          onLoad={e => measure(e.currentTarget)}
          src={src}
          alt="entry image"
          className="absolute inset-0 h-full w-full object-contain"
          style={maskStyle}
        />
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
          ...maskStyle,
        }}
      />
    </>
  );
};

export default EntryImage;
