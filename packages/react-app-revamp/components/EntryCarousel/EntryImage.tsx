import useIsomorphicLayoutEffect from "@hooks/useIsomorphicLayoutEffect";
import { recallImageAspectRatio, rememberImageAspectRatio } from "lib/image/aspectRatioRegistry";
import {
  buildCloudflareImageUrl,
  CAROUSEL_BACKDROP_IMAGE_PRESET,
  CAROUSEL_ENTRY_IMAGE_PRESET,
} from "lib/image/cloudflare";
import { useCloudflareFluidImage } from "lib/image/useCloudflareImage";
import { CSSProperties, FC, useMemo, useRef, useState } from "react";
import { CARD_IMAGE_MIN_VISIBLE } from "./constants";

interface EntryImageProps {
  src: string;
  fetchPriority?: "high" | "low" | "auto";
}

const LETTERBOX_SCALE_PCT = 100 / CARD_IMAGE_MIN_VISIBLE;
const LETTERBOX_OFFSET_PCT = (100 - LETTERBOX_SCALE_PCT) / 2;

const LETTERBOX_BOX_STYLE: CSSProperties = {
  width: `${LETTERBOX_SCALE_PCT}%`,
  height: `${LETTERBOX_SCALE_PCT}%`,
  left: `${LETTERBOX_OFFSET_PCT}%`,
  top: `${LETTERBOX_OFFSET_PCT}%`,
};

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
  const boxRef = useRef<HTMLDivElement>(null);
  const [boxRatio, setBoxRatio] = useState<number | null>(null);
  const [imageRatio, setImageRatio] = useState<number | null>(() => recallImageAspectRatio(src) ?? null);
  const [failed, setFailed] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const measureBox = () => {
      const { clientWidth, clientHeight } = box;
      setBoxRatio(clientWidth > 0 && clientHeight > 0 ? clientWidth / clientHeight : null);
    };
    measureBox();
    const ro = new ResizeObserver(measureBox);
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

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
      rememberImageAspectRatio(src, ratio);
      setImageRatio(ratio);
    }
  };

  const handleError = () => {
    if (!failed && fluid.src !== src) setFailed(true);
  };

  const coverVisible = imageRatio && boxRatio ? Math.min(boxRatio / imageRatio, imageRatio / boxRatio) : 0;
  const isCover = coverVisible >= CARD_IMAGE_MIN_VISIBLE;
  const edgeFade = imageRatio && boxRatio ? edgeFadeMask(imageRatio, boxRatio) : undefined;
  const letterboxStyle: CSSProperties = edgeFade
    ? { ...LETTERBOX_BOX_STYLE, maskImage: edgeFade, WebkitMaskImage: edgeFade }
    : LETTERBOX_BOX_STYLE;

  return (
    <div ref={boxRef} className="absolute inset-0">
      {isCover ? null : (
        <img
          src={failed ? src : backdropSrc}
          onError={handleError}
          decoding="async"
          draggable={false}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full scale-125 object-cover blur-2xl saturate-150 brightness-75"
        />
      )}
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
        className={isCover ? "absolute inset-0 h-full w-full object-cover" : "absolute max-w-none object-contain"}
        style={isCover ? undefined : letterboxStyle}
      />
    </div>
  );
};

export default EntryImage;
