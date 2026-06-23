import { MASCOT_PNG_BASE64 } from "./mascotBase64";
import { MASCOT_RECT, getMorphParams } from "./mascotMorph";

// Builds the mascot-morph avatar as a self-contained SVG data URI, for href/URL
// contexts (the price-curve <image> markers — see VoterAvatar.tsx). The mascot is
// base64-inlined because an SVG used as an image / data URI runs in a restricted
// mode where EXTERNAL resources don't load, so `<image href="/...png">` would
// silently fail here — the bytes must be embedded.
//   - MDN, "SVG as an Image" (external resources & scripts are disabled):
//     https://developer.mozilla.org/en-US/docs/Web/SVG/SVG_as_an_Image
//   - Chrome for Developers — data: URLs in SVG (the security rationale):
//     https://developer.chrome.com/blog/migrate-way-from-data-urls-in-svg-use
// The filter primitives below mirror GeneratedAvatar.tsx (per-primitive MDN links there).
export function generatedAvatarDataUri(seed: string, sizePx: number): string {
  const p = getMorphParams(seed);
  const r = MASCOT_RECT;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${sizePx}" height="${sizePx}" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">` +
    `<defs>` +
    `<filter id="f" x="-25%" y="-25%" width="150%" height="150%">` +
    `<feTurbulence type="fractalNoise" baseFrequency="${p.baseFrequency}" numOctaves="2" seed="${p.turbSeed}" result="n"/>` +
    `<feDisplacementMap in="SourceGraphic" in2="n" scale="${p.scale}" xChannelSelector="R" yChannelSelector="G" result="w"/>` +
    `<feColorMatrix in="w" type="hueRotate" values="${p.hueRotate}" result="h"/>` +
    `<feColorMatrix in="h" type="saturate" values="1.1"/>` +
    `</filter>` +
    `</defs>` +
    `<image href="${MASCOT_PNG_BASE64}" x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" preserveAspectRatio="xMidYMid meet" filter="url(#f)"/>` +
    `</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
