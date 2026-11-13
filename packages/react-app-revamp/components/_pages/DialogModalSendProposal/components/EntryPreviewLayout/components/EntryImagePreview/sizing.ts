import { ENTRY_CAROUSEL_STAGE_ID, PAGE_GUTTER_PX } from "@components/EntryCarousel/constants";
import { isMobileViewport } from "@helpers/isMobileViewport";
import { PreviewDevice } from "./types";

export const PREVIEW_MAX_WIDTH_PX = 252;
export const PREVIEW_MAX_HEIGHT_PX = 320;

const DESKTOP_TILE_SELECTOR = "[data-entry-id]";
const DESKTOP_TILE_FALLBACK_WIDTH_PX = 360;
const REFERENCE_PHONE_WIDTH_PX = 390;
const REFERENCE_CARD_HEIGHT_PER_WIDTH = 1.1;

export const viewerDevice = (): PreviewDevice => (isMobileViewport() ? "mobile" : "desktop");

export const measureDesktopTileWidth = (): number => {
  const tile = document.querySelector<HTMLElement>(DESKTOP_TILE_SELECTOR);
  return tile && tile.offsetWidth > 0 ? tile.offsetWidth : DESKTOP_TILE_FALLBACK_WIDTH_PX;
};

export const measureMobileCardSize = (): { width: number; height: number } => {
  const stage = document.getElementById(ENTRY_CAROUSEL_STAGE_ID);
  if (stage && stage.offsetHeight > 0) {
    return { width: stage.offsetWidth - 2 * PAGE_GUTTER_PX, height: stage.offsetHeight };
  }

  const viewportWidth = isMobileViewport() ? window.innerWidth : REFERENCE_PHONE_WIDTH_PX;
  const width = viewportWidth - 2 * PAGE_GUTTER_PX;
  return { width, height: Math.round(width * REFERENCE_CARD_HEIGHT_PER_WIDTH) };
};
