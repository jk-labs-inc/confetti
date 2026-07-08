import {
  buildCloudflareImageUrl,
  CAROUSEL_BACKDROP_IMAGE_PRESET,
  CAROUSEL_ENTRY_IMAGE_PRESET,
} from "lib/image/cloudflare";
import { useCloudflareFluidImage } from "lib/image/useCloudflareImage";
import { CSSProperties, FC, useMemo, useState } from "react";
import { COVER_MIN_VISIBLE } from "./constants";

interface EntryImageProps {
  src: string;
  boxAspect: number;
  fetchPriority?: "high" | "low" | "auto";
}

const ratioCache = new Map<string, number>();

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

const EntryImage: FC<EntryImageProps> = ({ src, boxAspect, fetchPriority = "auto" }) => {
  const [imageRatio, setImageRatio] = useState<number | null>(() => ratioCache.get(src) ?? null);
  const [failed, setFailed] = useState(false);

  const fluid = useCloudflareFluidImage(
    src,
    CAROUSEL_ENTRY_IMAGE_PRESET.widths,
    CAROUSEL_ENTRY_IMAGE_PRESET.coverSizes,
    { quality: CAROUSEL_ENTRY_IMAGE_PRESET.quality, fit: CAROUSEL_ENTRY_IMAGE_PRESET.fit },
  );
  const backdropSrc = useMemo(() => buildCloudflareImageUrl(src, CAROUSEL_BACKDROP_IMAGE_PRESET), [src]);

  const imgSrc = failed ? src : fluid.src;
  const imgSrcSet = failed ? undefined : fluid.srcSet;

  const measure = (img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth && img.naturalHeight) {
      const ratio = img.naturalWidth / img.naturalHeight;
      ratioCache.set(src, ratio);
      setImageRatio(ratio);
    }
  };

  // a transformed variant can fail where the original wouldn't (e.g. transform quota) — fall back once
  const handleError = () => {
    if (!failed && fluid.src !== src) setFailed(true);
  };

  const boxRatio = 1 / boxAspect; // both ratios as width / height
  const coverVisible = imageRatio ? Math.min(boxRatio / imageRatio, imageRatio / boxRatio) : 1;

  const edgeFade = imageRatio ? edgeFadeMask(imageRatio, boxRatio) : undefined;
  const maskStyle: CSSProperties | undefined = edgeFade
    ? { maskImage: edgeFade, WebkitMaskImage: edgeFade }
    : undefined;

  if (coverVisible >= COVER_MIN_VISIBLE) {
    return (
      <img
        ref={measure}
        onLoad={e => measure(e.currentTarget)}
        onError={handleError}
        src={imgSrc}
        srcSet={imgSrcSet}
        sizes={CAROUSEL_ENTRY_IMAGE_PRESET.coverSizes}
        fetchPriority={fetchPriority}
        decoding="async"
        draggable={false}
        alt="entry image"
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }

  return (
    <>
      <img
        src={failed ? src : backdropSrc}
        onError={handleError}
        decoding="async"
        draggable={false}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full scale-125 object-cover blur-2xl saturate-150 brightness-75"
      />
      <img
        src={imgSrc}
        srcSet={imgSrcSet}
        sizes={CAROUSEL_ENTRY_IMAGE_PRESET.letterboxSizes}
        onError={handleError}
        fetchPriority={fetchPriority}
        decoding="async"
        draggable={false}
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
