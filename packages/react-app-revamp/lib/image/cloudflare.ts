/**
 * Cloudflare Image Transformations helper.
 * Docs: https://developers.cloudflare.com/images/transform-images/transform-via-url/
 *
 * Everything in this module is PURE and SSR-safe (no React, no browser globals),
 * so it can be called from server or client components. Components that re-render
 * frequently should use the memoized hooks in `lib/image/useCloudflareImage`.
 */

const TRANSFORMABLE_HOSTS = new Set(["images.confetti.win", "dev.images.confetti.win"]);

/** 1–100. Lower = smaller file. 82 is visually lossless for photographic covers. */
const DEFAULT_QUALITY = 82;
const DEFAULT_FORMAT: CloudflareImageFormat = "auto";
const DEFAULT_FIT: CloudflareImageFit = "cover";

export type CloudflareImageFit = "scale-down" | "contain" | "cover" | "crop" | "pad";
export type CloudflareImageFormat = "auto" | "avif" | "webp" | "jpeg" | "png";

export interface CloudflareImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  fit?: CloudflareImageFit;
  format?: CloudflareImageFormat;
  dpr?: number;
  sharpen?: number;
}

/**
 * Type guard: true when `src` is a non-empty absolute URL pointing at one of our
 * Cloudflare-fronted image hosts, isn't already a transform URL, and isn't an SVG.
 */
export function isTransformableImageUrl(src?: string | null): src is string {
  if (!src) return false;
  if (src.includes("/cdn-cgi/image/")) return false;

  let url: URL;
  try {
    url = new URL(src);
  } catch {
    // Relative paths, data: URIs, malformed strings → leave untouched.
    return false;
  }

  if (!TRANSFORMABLE_HOSTS.has(url.hostname)) return false;
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
export function buildCloudflareImageUrl(src: string | null | undefined, options: CloudflareImageOptions = {}): string {
  if (!isTransformableImageUrl(src)) return src ?? "";
  const { origin } = new URL(src);
  return `${origin}/cdn-cgi/image/${serializeOptions(options)}/${src}`;
}

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

export const CONTEST_IMAGE_PRESETS = {
  /** Landing-page contest cards. Rendered as a CSS background, 320×256 on desktop. */
  landingCard: { width: 320, height: 256, quality: 90, fit: "cover" },
  /** Contest-page header thumbnail. Rendered as a 64×40 `<img object-cover>`. */
  headerThumb: { width: 64, height: 40, quality: 82, fit: "cover", sharpen: 1 },
  /** Smaller 40×30 thumbnail variant (e.g. voting sidebar). */
  headerThumbSmall: { width: 40, height: 30, quality: 82, fit: "cover", sharpen: 1 },
} satisfies Record<string, CloudflareImageOptions>;

export type ContestImagePreset = keyof typeof CONTEST_IMAGE_PRESETS;

export const ENTRY_IMAGE_PRESET = {
  quality: 90,
  fit: "scale-down",
  widths: [384, 512, 640, 768, 1024, 1280],
  sizes: "(min-width: 1024px) 360px, (min-width: 768px) calc(50vw - 60px), calc(100vw - 56px)",
} satisfies { quality: number; fit: CloudflareImageFit; widths: number[]; sizes: string };

/** mobile entry-carousel cards. `scale-down` (never crop, never upscale) keeps the natural aspect ratio intact */
export const CAROUSEL_ENTRY_IMAGE_PRESET = {
  quality: 82,
  fit: "scale-down",
  widths: [480, 640, 768, 1024],
  coverSizes: "62vw",
  letterboxSizes: "83vw",
} satisfies { quality: number; fit: CloudflareImageFit; widths: number[]; coverSizes: string; letterboxSizes: string };

/** Tiny source for the carousel's blurred letterbox backdrop — it sits behind a 40px blur, so 64px of detail is plenty. */
export const CAROUSEL_BACKDROP_IMAGE_PRESET = {
  width: 64,
  quality: 50,
  fit: "scale-down",
} satisfies CloudflareImageOptions;
