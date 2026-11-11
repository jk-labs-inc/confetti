import { useParentSize } from "@visx/responsive";
import {
  buildCloudflareImageUrl,
  CAROUSEL_BACKDROP_IMAGE_PRESET,
  CAROUSEL_ENTRY_IMAGE_PRESET,
} from "lib/image/cloudflare";
import { useCloudflareFluidImage } from "lib/image/useCloudflareImage";
import { CSSProperties, FC, useMemo, useState } from "react";
import { CARD_IMAGE_MIN_VISIBLE } from "./constants";

interface EntryImageProps {
  src: string;
  fetchPriority?: "high" | "low" | "auto";
}

const ratioCache = new Map<string, number>();

const LETTERBOX_SCALE_PCT = 100 / CARD_IMAGE_MIN_VISIBLE;
const LETTERBOX_OFFSET_PCT = (100 - LETTERBOX_SCALE_PCT) / 2;

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

const EntryImage: FC<EntryImageProps> = ({ src, fetchPriority = "auto" }) => {
  const [imageRatio, setImageRatio] = useState<number | null>(() => ratioCache.get(src) ?? null);
  const [failed, setFailed] = useState(false);
  const { parentRef, width: boxWidth, height: boxHeight } = useParentSize({ debounceTime: 0 });

  const fluid = useCloudflareFluidImage(src, CAROUSEL_ENTRY_IMAGE_PRESET.widths, CAROUSEL_ENTRY_IMAGE_PRESET.sizes, {
    quality: CAROUSEL_ENTRY_IMAGE_PRESET.quality,
    fit: CAROUSEL_ENTRY_IMAGE_PRESET.fit,
  });
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

  const handleError = () => {
    if (!failed && fluid.src !== src) setFailed(true);
  };

  const boxRatio = boxWidth > 0 && boxHeight > 0 ? boxWidth / boxHeight : null;
  const coverVisible = imageRatio && boxRatio ? Math.min(boxRatio / imageRatio, imageRatio / boxRatio) : 0;
  const edgeFade = imageRatio && boxRatio ? edgeFadeMask(imageRatio, boxRatio) : undefined;
  const maskStyle: CSSProperties | undefined = edgeFade
    ? { maskImage: edgeFade, WebkitMaskImage: edgeFade }
    : undefined;

  return (
    <div ref={parentRef} className="absolute inset-0">
      {coverVisible >= CARD_IMAGE_MIN_VISIBLE ? (
        <img
          ref={measure}
          onLoad={event => measure(event.currentTarget)}
          onError={handleError}
          src={imgSrc}
          srcSet={imgSrcSet}
          sizes={CAROUSEL_ENTRY_IMAGE_PRESET.sizes}
          fetchPriority={fetchPriority}
          decoding="async"
          draggable={false}
          alt="entry image"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
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
            ref={measure}
            onLoad={event => measure(event.currentTarget)}
            src={imgSrc}
            srcSet={imgSrcSet}
            sizes={CAROUSEL_ENTRY_IMAGE_PRESET.sizes}
            onError={handleError}
            fetchPriority={fetchPriority}
            decoding="async"
            draggable={false}
            alt="entry image"
            className="absolute max-w-none object-contain"
            style={{
              width: `${LETTERBOX_SCALE_PCT}%`,
              height: `${LETTERBOX_SCALE_PCT}%`,
              left: `${LETTERBOX_OFFSET_PCT}%`,
              top: `${LETTERBOX_OFFSET_PCT}%`,
              ...maskStyle,
            }}
          />
        </>
      )}
    </div>
  );
};

export default EntryImage;
