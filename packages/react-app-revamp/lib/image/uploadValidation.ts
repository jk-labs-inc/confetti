/**
 * Docs: https://developers.cloudflare.com/images/get-started/limits/
 */
import { ACCEPTED_FILE_TYPES } from "@components/UI/ImageUpload/utils";

/* 10 MB */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/* cloudflare transform ceiling, per side. */
export const MAX_UPLOAD_DIMENSION = 12_000;

/* cloudflare transform ceiling, total area. */
export const MAX_UPLOAD_MEGAPIXELS = 100;

const MAX_UPLOAD_PIXELS = MAX_UPLOAD_MEGAPIXELS * 1_000_000;
const MAX_UPLOAD_MB = Math.round(MAX_UPLOAD_BYTES / (1024 * 1024));

const INVALID_TYPE_MESSAGE = "please upload a valid image/gif file (JPEG, JPG, PNG, JFIF, GIF, or WebP)";

/* synchronous checks (MIME type + byte size). */
export function getUploadFileError(file: File): string | null {
  if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
    return INVALID_TYPE_MESSAGE;
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `file size should be less than ${MAX_UPLOAD_MB}MB`;
  }
  return null;
}

export async function getUploadDimensionError(file: File): Promise<string | null> {
  const dimensions = await readImageDimensions(file);
  if (!dimensions) return null;

  const { width, height } = dimensions;
  if (width > MAX_UPLOAD_DIMENSION || height > MAX_UPLOAD_DIMENSION) {
    return `image is too large to optimize (max ${MAX_UPLOAD_DIMENSION.toLocaleString()}px per side)`;
  }
  if (width * height > MAX_UPLOAD_PIXELS) {
    return `image is too large to optimize (max ${MAX_UPLOAD_MEGAPIXELS} megapixels)`;
  }
  return null;
}

/* full validation (type + size, then dimensions). */
export async function validateImageUpload(file: File): Promise<string | null> {
  return getUploadFileError(file) ?? (await getUploadDimensionError(file));
}

function readImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  if (typeof window === "undefined") return Promise.resolve(null);

  return new Promise(resolve => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}
