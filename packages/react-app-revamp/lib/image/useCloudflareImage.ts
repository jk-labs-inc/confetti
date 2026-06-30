import { useMemo } from "react";
import {
  buildCloudflareImageUrl,
  buildDensitySrcSet,
  buildWidthSrcSet,
  type CloudflareImageOptions,
} from "lib/image/cloudflare";

export function useCloudflareImage(
  src: string | null | undefined,
  options: CloudflareImageOptions,
  densities: number[] = [1, 2, 3],
): { src: string; srcSet: string | undefined } {
  const { width, height, quality, fit, format, dpr, sharpen } = options;
  const densityKey = densities.join(",");

  return useMemo(() => {
    const resolved: CloudflareImageOptions = { width, height, quality, fit, format, dpr, sharpen };
    return {
      src: buildCloudflareImageUrl(src, resolved),
      srcSet: buildDensitySrcSet(src, resolved, densities),
    };
  }, [src, width, height, quality, fit, format, dpr, sharpen, densityKey]);
}

/**
 * FLUID `<img>` (spans a range of widths, e.g. a full-width content image):
 * returns `{ src, srcSet, sizes }` using width descriptors. `src` is the largest
 * width as a sensible fallback for browsers without `srcSet`.
 */
export function useCloudflareFluidImage(
  src: string | null | undefined,
  widths: number[],
  sizes: string,
  options: CloudflareImageOptions = {},
): { src: string; srcSet: string | undefined; sizes: string } {
  const { quality, fit, format, sharpen } = options;
  const widthsKey = widths.join(",");

  return useMemo(() => {
    const resolved: CloudflareImageOptions = { quality, fit, format, sharpen };
    const largest = widths.length ? Math.max(...widths) : undefined;
    return {
      src: buildCloudflareImageUrl(src, { ...resolved, width: largest }),
      srcSet: buildWidthSrcSet(src, widths, resolved),
      sizes,
    };
  }, [src, widthsKey, sizes, quality, fit, format, sharpen]);
}

export function useCloudflareBackgroundImage(
  src: string | null | undefined,
  options: CloudflareImageOptions,
  dpr: number = 2,
): { url: string; backgroundImage: string | undefined } {
  const { width, height, quality, fit, format, sharpen } = options;

  return useMemo(() => {
    const url = buildCloudflareImageUrl(src, {
      width: width ? width * dpr : undefined,
      height: height ? height * dpr : undefined,
      quality,
      fit,
      format,
      sharpen,
    });
    return { url, backgroundImage: url ? `url("${url}")` : undefined };
  }, [src, width, height, quality, fit, format, sharpen, dpr]);
}
