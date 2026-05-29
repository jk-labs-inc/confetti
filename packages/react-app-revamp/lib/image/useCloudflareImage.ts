"use client";

import { useMemo } from "react";
import {
  buildCloudflareImageUrl,
  buildDensitySrcSet,
  buildWidthSrcSet,
  type CloudflareImageOptions,
} from "lib/image/cloudflare";

/**
 * Memoized Cloudflare image helpers for React components.
 *
 * These wrap the pure builders in `lib/image/cloudflare` in `useMemo` so the
 * transform URLs/srcsets are computed once per (src, options) rather than on
 * every render — important for components that re-render often (the landing
 * card re-renders on every hover/scroll via Framer Motion).
 *
 * For server components or rarely-rendered leaves, prefer the pure builders
 * directly — no hook (and no client boundary) required.
 */

/**
 * FIXED-size `<img>`: returns `{ src, srcSet }` with density variants (1x/2x/3x)
 * so the browser fetches only the resolution matching the device. Spread onto an
 * `<img>` that already has explicit width/height (e.g. a 64×40 thumbnail).
 */
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, widthsKey, sizes, quality, fit, format, sharpen]);
}

/**
 * CSS `background-image`: returns `{ url, backgroundImage }`. Backgrounds can't
 * use `srcSet`, so we serve a single asset sized for high-density displays
 * (logical size × `dpr`, default 2). `url` is exposed separately so callers can
 * also use it to preload (e.g. a blur-up `new Image()`), avoiding a second fetch
 * of the original.
 */
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, width, height, quality, fit, format, sharpen, dpr]);
}
