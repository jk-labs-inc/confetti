/**
 * Cloudflare Image Transformations helper.
 *
 * Our user-uploaded contest images live in R2 and are served from the Cloudflare
 * zone `confetti.win` via the custom domains below. Because they are fronted by
 * Cloudflare, we can resize / re-compress / re-encode them on the fly through the
 * `/cdn-cgi/image/<options>/<source>` endpoint instead of shipping the original
 * (often multi-MB) PNG to every visitor. A 3.4 MB cover becomes a ~16–80 KB AVIF.
 *
 * Docs: https://developers.cloudflare.com/images/transform-images/transform-via-url/
 *
 * Everything in this module is PURE and SSR-safe (no React, no browser globals),
 * so it can be called from server or client components. Components that re-render
 * frequently should use the memoized hooks in `lib/image/useCloudflareImage`.
 */

/**
 * Hosts whose objects are fronted by our Cloudflare zone and therefore support
 * `/cdn-cgi/image` transforms. Anything else (IPFS, arbitrary pasted URLs, data
 * URIs, relative paths, SVGs) is returned untouched so callers can pass any src.
 */
const TRANSFORMABLE_HOSTS = new Set(["images.confetti.win", "dev.images.confetti.win"]);

/** 1–100. Lower = smaller file. 82 is visually lossless for photographic covers. */
const DEFAULT_QUALITY = 82;
/** "auto" serves AVIF/WebP based on the browser's `Accept` header, PNG/JPEG otherwise. */
const DEFAULT_FORMAT: CloudflareImageFormat = "auto";
const DEFAULT_FIT: CloudflareImageFit = "cover";

export type CloudflareImageFit = "scale-down" | "contain" | "cover" | "crop" | "pad";
export type CloudflareImageFormat = "auto" | "avif" | "webp" | "jpeg" | "png";

export interface CloudflareImageOptions {
  /** Target width in device pixels. */
  width?: number;
  /** Target height in device pixels. */
  height?: number;
  /** 1–100. Defaults to 82. */
  quality?: number;
  /** How the image fills the width/height box. Defaults to "cover". */
  fit?: CloudflareImageFit;
  /** Output format. Defaults to "auto" (AVIF/WebP negotiation). */
  format?: CloudflareImageFormat;
  /** Device-pixel-ratio multiplier; Cloudflare multiplies width/height by this. */
  dpr?: number;
  /** 0–10. A small value (≈1) counteracts the softening introduced by downscaling. */
  sharpen?: number;
}

/**
 * Type guard: true when `src` is a non-empty absolute URL pointing at one of our
 * Cloudflare-fronted image hosts, isn't already a transform URL, and isn't an SVG.
 */
export function isTransformableImageUrl(src?: string | null): src is string {
  if (!src) return false;
  // Already wrapped — never double-transform.
  if (src.includes("/cdn-cgi/image/")) return false;

  let url: URL;
  try {
    url = new URL(src);
  } catch {
    // Relative paths, data: URIs, malformed strings → leave untouched.
    return false;
  }

  if (!TRANSFORMABLE_HOSTS.has(url.hostname)) return false;
  // SVGs are vectors; rasterizing them usually bloats rather than shrinks.
  if (url.pathname.toLowerCase().endsWith(".svg")) return false;

  return true;
}

function serializeOptions(options: CloudflareImageOptions): string {
  const {
    width,
    height,
    quality = DEFAULT_QUALITY,
    fit = DEFAULT_FIT,
    format = DEFAULT_FORMAT,
    dpr,
    sharpen,
  } = options;

  const directives: string[] = [];
  if (width) directives.push(`width=${Math.round(width)}`);
  if (height) directives.push(`height=${Math.round(height)}`);
  directives.push(`quality=${quality}`);
  directives.push(`fit=${fit}`);
  directives.push(`format=${format}`);
  if (dpr) directives.push(`dpr=${dpr}`);
  if (sharpen) directives.push(`sharpen=${sharpen}`);

  return directives.join(",");
}

/**
 * Wrap an image URL in a Cloudflare transformation. Non-transformable inputs
 * (external / IPFS / data / SVG / empty) are returned unchanged, so this is
 * always safe to call on any `src`.
 */
export function buildCloudflareImageUrl(
  src: string | null | undefined,
  options: CloudflareImageOptions = {},
): string {
  if (!isTransformableImageUrl(src)) return src ?? "";
  // The transform is served from the same zone as the source; pass the original
  // absolute URL as the source segment (the form we verified end-to-end).
  const { origin } = new URL(src);
  return `${origin}/cdn-cgi/image/${serializeOptions(options)}/${src}`;
}

/**
 * `srcSet` using density descriptors (1x/2x/3x…) for FIXED-size `<img>`s
 * (e.g. a 64×40 thumbnail). The browser downloads only the variant matching the
 * device's pixel ratio. Returns `undefined` for non-transformable sources so the
 * caller can simply omit the attribute.
 */
export function buildDensitySrcSet(
  src: string | null | undefined,
  options: CloudflareImageOptions,
  densities: number[] = [1, 2, 3],
): string | undefined {
  if (!isTransformableImageUrl(src) || !options.width) return undefined;
  return densities
    .map(density => {
      const url = buildCloudflareImageUrl(src, {
        ...options,
        width: options.width! * density,
        height: options.height ? options.height * density : undefined,
      });
      return `${url} ${density}x`;
    })
    .join(", ");
}

/**
 * `srcSet` using width descriptors for FLUID `<img>`s that span a range of
 * widths (e.g. a full-width content/proposal image). Pair with a `sizes`
 * attribute so the browser can pick the smallest sufficient candidate.
 */
export function buildWidthSrcSet(
  src: string | null | undefined,
  widths: number[],
  options: CloudflareImageOptions = {},
): string | undefined {
  if (!isTransformableImageUrl(src)) return undefined;
  return widths.map(width => `${buildCloudflareImageUrl(src, { ...options, width })} ${width}w`).join(", ");
}

/**
 * Centralized display-size presets for contest cover images — the single source
 * of truth for the widths/quality used at each UI slot. Widths are the LOGICAL
 * (1×) CSS size; the hooks generate the right pixel density per device.
 */
export const CONTEST_IMAGE_PRESETS = {
  /** Landing-page contest cards. Rendered as a CSS background, 320×256 on desktop. */
  landingCard: { width: 320, height: 256, quality: 90, fit: "cover" },
  /** Contest-page header thumbnail. Rendered as a 64×40 `<img object-cover>`. */
  headerThumb: { width: 64, height: 40, quality: 82, fit: "cover", sharpen: 1 },
  /** Smaller 40×30 thumbnail variant (e.g. voting sidebar). */
  headerThumbSmall: { width: 40, height: 30, quality: 82, fit: "cover", sharpen: 1 },
} satisfies Record<string, CloudflareImageOptions>;

export type ContestImagePreset = keyof typeof CONTEST_IMAGE_PRESETS;

/**
 * Proposal / entry images are user-generated CONTENT, shown via `object-contain`
 * (the whole image, never cropped) in a 1-column (mobile) / 2-column (desktop)
 * masonry inside the ~760px contest column.
 *
 * Unlike the decorative covers, quality is kept HIGH here — the size win comes
 * from resizing to the display width + AVIF, not from compression. `fit:
 * scale-down` guarantees we never upscale (and blur) a small upload.
 *
 * Candidate `widths` are device pixels; the browser downloads only the single
 * variant its size/DPR needs, so this list does not multiply transform cost.
 * `sizes` mirrors the masonry: ~360px per column on desktop, ~50vw on tablet,
 * full-width on mobile.
 */
export const ENTRY_IMAGE_PRESET = {
  quality: 90,
  fit: "scale-down",
  widths: [384, 512, 640, 768, 1024, 1280],
  sizes: "(min-width: 1024px) 360px, (min-width: 768px) calc(50vw - 60px), calc(100vw - 56px)",
} satisfies { quality: number; fit: CloudflareImageFit; widths: number[]; sizes: string };
